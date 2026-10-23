from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.lead import Lead
from app.models.follow_up import FollowUp
from app.models.activity import Activity
from app.schemas.ai import (
    AIScoreUpdateRequest,
    AISummaryUpdateRequest,
    AILeadInsightsResponse,
    AIMessageDraftRequest,
    AIMessageDraftResponse,
    AIDailyManagerItem,
    AIDailyManagerResponse,
    AIDuplicateAnalysisResponse,
    AIDuplicateCandidate,
)
from app.services.duplicate_service import check_lead_duplicates


def get_lead_insights(lead: Lead) -> AILeadInsightsResponse:
    """
    Returns AI-driven insights for a lead, incorporating current ML score,
    heuristic feature importance factors, stage recommendation, and next actions.
    Accurately returns persisted conversion_probability when available.
    """
    score = lead.ai_score if lead.ai_score is not None else 70
    prob = lead.conversion_probability if lead.conversion_probability is not None else round(score / 100.0, 2)
    
    # Heuristic key factors based on lead data
    key_factors = []
    if lead.expected_value and lead.expected_value >= 50000:
        key_factors.append(f"High deal value ({lead.currency} {lead.expected_value:,.0f}) indicates strong enterprise scope")
    if lead.lead_source in ["Referral", "Meta Lead Ads"]:
        key_factors.append(f"High-intent acquisition channel: {lead.lead_source}")
    if lead.priority in ["High", "Urgent"]:
        key_factors.append("Marked high priority by commercial team")
    if not key_factors:
        key_factors.append(f"Category match: {lead.lead_category or 'Fintech / Banking'}")
        key_factors.append("Standard progression pipeline indicators")

    # Recommended stage
    rec_stage = lead.pipeline_stage or "Contacted"
    if score >= 85 and lead.pipeline_stage in ["New", "Contacted"]:
        rec_stage = "Qualified"
    elif score >= 90 and lead.pipeline_stage == "Qualified":
        rec_stage = "Proposal"

    # Action recommendations
    next_actions = [
        f"Schedule executive alignment call with {lead.full_name}",
        f"Send Belvo Creative Portfolio and branding strategy tailored for {lead.company}",
        "Confirm budget and Q4 procurement timeline"
    ]

    summary = lead.ai_summary or (
        f"{lead.company} is an active prospect evaluated for Belvo brand strategy and creative scaling solutions. "
        f"Propensity score of {score}/100 based on enterprise tier and domain fit."
    )

    return AILeadInsightsResponse(
        leadId=lead.id,
        company=lead.company,
        fullName=lead.full_name,
        aiScore=score,
        conversionProbability=prob,
        aiSummary=summary,
        keyFactors=key_factors,
        recommendedStage=rec_stage,
        nextBestActions=next_actions
    )


def update_lead_score(db: Session, lead: Lead, req: AIScoreUpdateRequest, specialist_name: str) -> Lead:
    """
    Persists ML score and independent conversion probability into lead record and logs an activity audit record.
    """
    old_score = lead.ai_score
    lead.ai_score = req.aiScore
    lead.conversion_probability = req.conversionProbability
    lead.ai_model_version = req.modelVersion
    lead.ai_scored_at = datetime.now(timezone.utc)
    
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    act = Activity(
        id=f"ACT-ML-{int(datetime.now().timestamp() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="note",
        description=f"AI Score adjusted from {old_score} to {req.aiScore}. Probability: {req.conversionProbability:.0%}. Drivers: {', '.join(req.keyFactors or [])}",
        timestamp=now_str,
        performed_by=f"Belvo ML Engine ({req.modelVersion})"
    )
    db.add(act)
    db.commit()
    db.refresh(lead)
    return lead


def update_lead_summary(db: Session, lead: Lead, req: AISummaryUpdateRequest, specialist_name: str) -> Lead:
    """
    Persists NLP summary generated for prospect.
    """
    lead.ai_summary = req.summary
    
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    act = Activity(
        id=f"ACT-NLP-{int(datetime.now().timestamp() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="note",
        description=f"AI NLP Summary updated. Sentiment: {req.sentiment} | Intent: {req.buyingIntent}",
        timestamp=now_str,
        performed_by=f"Belvo NLP Engine ({req.modelVersion})"
    )
    db.add(act)
    db.commit()
    db.refresh(lead)
    return lead


def generate_message_draft(lead: Lead, req: AIMessageDraftRequest) -> AIMessageDraftResponse:
    """
    Generates intelligent communication draft (Email, WhatsApp, LinkedIn)
    tailored to the lead's company, priority, and stage.
    Supports real-time Generative AI via external LLM provider if configured,
    or high-precision agency templates with graceful offline fallback.
    """
    import os
    import httpx
    from app.config import settings

    channel = req.channel.capitalize()
    tone = (req.tone or "Professional").capitalize()
    objective = req.objective or "Follow up on agency partnership and scope"

    # Attempt Live LLM Generation if API Key is configured
    llm_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if llm_key:
        try:
            prompt = (
                f"Write a {tone.lower()} {channel} outreach message for Belvo Creative Agency to {lead.full_name} at {lead.company}.\n"
                f"Service category: {lead.lead_category or 'Brand Building & Web Development'}.\n"
                f"Stage: {lead.pipeline_stage}. Estimated value: {lead.currency} {lead.expected_value or 0}.\n"
                f"Objective: {objective}.\n"
                f"Include the name 'Belvo'. Keep it concise, engaging, and professional."
            )
            with httpx.Client(timeout=6.0) as client:
                res = client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {llm_key}"},
                    json={
                        "model": getattr(settings, "OPENAI_MODEL", "gpt-4o-mini"),
                        "messages": [
                            {"role": "system", "content": "You are an AI sales copywriter for Belvo Creative Agency (belvo.buzz). Always include 'Belvo' in outputs."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 300
                    }
                )
                if res.status_code == 200:
                    generated_text = res.json()["choices"][0]["message"]["content"].strip()
                    subject_line = f"Belvo & {lead.company} — Brand Acceleration Roadmap" if channel == "Email" else None
                    return AIMessageDraftResponse(
                        leadId=lead.id,
                        channel=channel,
                        subject=subject_line,
                        bodyDraft=generated_text,
                        suggestedSendTime="Tomorrow at 10:00 AM Local Time",
                        confidence=0.96,
                        isHeuristicTemplate=False
                    )
        except Exception:
            pass  # Fall back to calibrated agency templates

    # Calibrated High-Conversion Agency Templates (Guarantees 'Belvo' is present)
    if channel == "Whatsapp":
        subject = None
        body = (
            f"Hola {lead.full_name}, greetings from Belvo! "
            f"Following up on {lead.company}'s brand identity and digital scaling goals. "
            f"Do you have 10 minutes today to review the creative brief and campaign roadmap? Looking forward to connecting."
        )
    elif channel == "Linkedin":
        subject = f"Connecting regarding {lead.company} & Belvo Creative Agency"
        body = (
            f"Hi {lead.full_name},\n\n"
            f"I noticed {lead.company}'s recent scaling initiatives and market presence. "
            f"Belvo Creative Agency partners with high-growth brands to build standout visual identities, modern web applications, and performance marketing campaigns.\n\n"
            f"Would love to connect and share our latest case studies and agency portfolio."
        )
    else:  # Email
        subject = f"Belvo & {lead.company} — Next Steps on Brand & Digital Growth"
        body = (
            f"Dear {lead.full_name},\n\n"
            f"Thank you for connecting with the Belvo team regarding {lead.company}'s commercial objectives. "
            f"Based on your focus in {lead.lead_category or 'creative brand scaling'}, our agency delivers end-to-end "
            f"brand building, modern web development, and performance campaigns.\n\n"
            f"We would welcome the opportunity to review our tailored proposal and discuss your estimated {lead.currency} "
            f"{lead.expected_value:,.0f} project scope.\n\n"
            f"Best regards,\nBelvo Creative Solutions Team"
        )

    return AIMessageDraftResponse(
        leadId=lead.id,
        channel=channel,
        subject=subject,
        bodyDraft=body,
        suggestedSendTime="Tomorrow at 10:00 AM Local Time",
        confidence=None,
        isHeuristicTemplate=True
    )


def get_daily_manager_brief(db: Session, specialist_name: Optional[str] = None) -> AIDailyManagerResponse:
    """
    Compiles AI Daily Manager priority agenda for sales specialists or admins.
    Highlights overdue tasks, high-probability opportunities, and stalled deals.
    """
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")

    # Query leads
    leads_query = db.query(Lead).filter(Lead.is_archived == False)
    if specialist_name:
        leads_query = leads_query.filter(Lead.assigned_employee == specialist_name)
    leads = leads_query.all()

    # Query follow-ups
    fu_query = db.query(FollowUp).filter(FollowUp.status != "Completed")
    if specialist_name:
        fu_query = fu_query.filter(FollowUp.assigned_employee == specialist_name)
    pending_follow_ups = fu_query.all()

    overdue_alerts: List[AIDailyManagerItem] = []
    for fu in pending_follow_ups:
        # Check if overdue based on due_date (YYYY-MM-DD)
        is_overdue = False
        if fu.due_date and fu.due_date < today_str:
            is_overdue = True
        elif fu.due_date == today_str and fu.due_time:
            current_time_str = now.strftime("%H:%M")
            if fu.due_time < current_time_str:
                is_overdue = True

        if is_overdue:
            overdue_alerts.append(AIDailyManagerItem(
                urgency="Critical",
                title=f"Overdue Follow-up: {fu.title}",
                leadId=fu.lead_id or "",
                company=fu.company or "Unknown",
                action=f"Execute {fu.type or 'Call'} immediately",
                reason=f"Scheduled for {fu.due_date} {fu.due_time or ''} but not completed"
            ))

    top_opportunities: List[AIDailyManagerItem] = []
    # Sort leads by score descending
    sorted_leads = sorted(leads, key=lambda l: (l.ai_score or 0), reverse=True)
    for lead in sorted_leads[:5]:
        if (lead.ai_score or 0) >= 80:
            top_opportunities.append(AIDailyManagerItem(
                urgency="High",
                title=f"High-Propensity Deal: {lead.company}",
                leadId=lead.id,
                company=lead.company,
                action=f"Accelerate to Proposal / Meeting (Stage: {lead.pipeline_stage})",
                reason=f"AI Score: {lead.ai_score}/100. Potential value: {lead.currency} {lead.expected_value:,.0f}"
            ))

    stalled_deals: List[AIDailyManagerItem] = []
    for lead in leads:
        if lead.pipeline_stage in ["Contacted", "Qualified", "Meeting"] and not lead.next_follow_up_date:
            stalled_deals.append(AIDailyManagerItem(
                urgency="Medium",
                title=f"No Future Follow-up Scheduled: {lead.company}",
                leadId=lead.id,
                company=lead.company,
                action="Schedule discovery or proposal follow-up",
                reason="Lead is in active pipeline but has no future touchpoint logged"
            ))

    summary_text = (
        f"Good day! You have {len(leads)} active managed accounts. "
        f"{len(overdue_alerts)} urgent overdue tasks require immediate action, "
        f"and {len(top_opportunities)} high-intent enterprise accounts are ripe for advancement."
    )

    return AIDailyManagerResponse(
        date=today_str,
        salesSpecialist=specialist_name or "All Team Members",
        totalFocusLeads=len(leads),
        overdueAlerts=overdue_alerts[:10],
        topOpportunities=top_opportunities[:5],
        stalledDeals=stalled_deals[:5],
        dailySummary=summary_text
    )


def run_ai_duplicate_analysis(db: Session, email: Optional[str], phone: Optional[str], company: Optional[str], full_name: Optional[str]) -> AIDuplicateAnalysisResponse:
    """
    Leverages multi-factor deterministic and similarity checks to return structured duplicate candidates.
    """
    matches = check_lead_duplicates(db, email=email, phone=phone, company=company, full_name=full_name)
    
    candidates: List[AIDuplicateCandidate] = []
    for m in matches:
        cand_score = 0.95 if "Exact email" in m.matchReason else 0.85
        candidates.append(AIDuplicateCandidate(
            existingLeadId=m.existingLeadId,
            company=m.company,
            name=m.fullName,
            matchType=m.matchReason,
            confidenceScore=cand_score,
            similarityDetails={
                "emailMatch": 1.0 if email and m.email and m.email.lower() == email.lower() else 0.0,
                "companyMatch": 1.0 if company and m.company and m.company.lower() == company.lower() else 0.5,
                "phoneMatch": 1.0 if phone and m.phone and m.phone == phone else 0.0
            }
        ))

    return AIDuplicateAnalysisResponse(
        hasPotentialDuplicate=len(candidates) > 0,
        candidates=candidates
    )
