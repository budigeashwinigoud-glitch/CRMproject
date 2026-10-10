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
    This contract allows Thrija's models to plug in while providing realistic defaults.
    """
    score = lead.ai_score if lead.ai_score is not None else 70
    prob = round(score / 100.0, 2)
    
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
        f"Send Belvo Open Finance API collateral tailored for {lead.company}",
        "Confirm budget and Q4 procurement timeline"
    ]

    summary = lead.ai_summary or (
        f"{lead.company} is an active prospect evaluated for Belvo financial data APIs. "
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
    Persists ML score update into lead record and logs an activity audit record.
    """
    old_score = lead.ai_score
    lead.ai_score = req.aiScore
    
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    act = Activity(
        id=f"ACT-ML-{int(datetime.now().timestamp() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="note",
        description=f"AI Score adjusted from {old_score} to {req.aiScore}. Probability: {req.conversionProbability:.0%}. Drivers: {', '.join(req.keyFactors or [])}",
        timestamp=now_str,
        performed_by=f"Thrija ML Engine ({req.modelVersion})"
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
        performed_by=f"Thrija NLP Engine ({req.modelVersion})"
    )
    db.add(act)
    db.commit()
    db.refresh(lead)
    return lead


def generate_message_draft(lead: Lead, req: AIMessageDraftRequest) -> AIMessageDraftResponse:
    """
    Generates intelligent communication draft (Email, WhatsApp, LinkedIn)
    tailored to the lead's company, priority, and stage.
    """
    channel = req.channel.capitalize()
    tone = (req.tone or "Professional").capitalize()
    
    if channel == "Whatsapp":
        subject = None
        body = (
            f"Hola {lead.full_name}, greeting from Belvo! "
            f"Following up on {lead.company}'s open finance and payments integration inquiry. "
            f"Do you have 10 minutes today to review the technical proposal? Looking forward to connecting."
        )
    elif channel == "Linkedin":
        subject = f"Connecting regarding {lead.company} & Belvo Open Finance"
        body = (
            f"Hi {lead.full_name},\n\n"
            f"I noticed {lead.company}'s growth initiatives in Latin America financial data solutions. "
            f"Belvo powers seamless bank aggregation and fiscal enrichment for leading platforms. "
            f"Would love to connect and share our developer sandbox documentation."
        )
    else:  # Email
        subject = f"Belvo & {lead.company} — Next Steps on Open Finance Integration"
        body = (
            f"Dear {lead.full_name},\n\n"
            f"Thank you for connecting with the Belvo team regarding {lead.company}'s commercial requirements. "
            f"Based on your focus in {lead.lead_category or 'financial services'}, our single API allows seamless "
            f"access to 90%+ bank coverage and instant account verification across Mexico, Colombia, and Brazil.\n\n"
            f"We would welcome the opportunity to walk through a tailored demo and discuss your estimated {lead.currency} "
            f"{lead.expected_value:,.0f} deployment scope.\n\n"
            f"Best regards,\nBelvo Commercial Solutions Team"
        )

    return AIMessageDraftResponse(
        leadId=lead.id,
        channel=channel,
        subject=subject,
        bodyDraft=body,
        suggestedSendTime="Tomorrow at 10:00 AM Local Time",
        confidence=0.92
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
