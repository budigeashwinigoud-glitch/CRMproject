from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.lead import Lead
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.schemas.ai import (
    AIScoreUpdateRequest,
    AISummaryUpdateRequest,
    AILeadInsightsResponse,
    AIMessageDraftRequest,
    AIMessageDraftResponse,
    AIDailyManagerResponse,
    AIDuplicateAnalysisResponse,
)
from app.services.ai_service import (
    get_lead_insights,
    update_lead_score,
    update_lead_summary,
    generate_message_draft,
    get_daily_manager_brief,
    run_ai_duplicate_analysis,
)
from app.routers.leads import check_lead_access

router = APIRouter(prefix="/ai", tags=["AI Integration (Contracts for Thrija)"])


@router.get("/leads/{lead_id}/insights", response_model=AILeadInsightsResponse)
def get_lead_ai_insights_endpoint(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Contract endpoint: Retrieve AI scoring insights, feature factors, and recommended actions.
    Enforces employee lead boundary.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")
    check_lead_access(lead, current_user)
    return get_lead_insights(lead)


@router.post("/leads/{lead_id}/score", response_model=AILeadInsightsResponse)
def update_lead_ai_score_endpoint(
    lead_id: str,
    req: AIScoreUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Contract endpoint: Update AI lead score and conversion probability from Thrija's ML engine.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")
    check_lead_access(lead, current_user)
    lead = update_lead_score(db, lead, req, current_user.full_name)
    return get_lead_insights(lead)


@router.post("/leads/{lead_id}/summary", response_model=AILeadInsightsResponse)
def update_lead_ai_summary_endpoint(
    lead_id: str,
    req: AISummaryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Contract endpoint: Update AI NLP summary from Thrija's summarization pipeline.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")
    check_lead_access(lead, current_user)
    lead = update_lead_summary(db, lead, req, current_user.full_name)
    return get_lead_insights(lead)


@router.post("/leads/{lead_id}/draft-message", response_model=AIMessageDraftResponse)
def draft_ai_message_endpoint(
    lead_id: str,
    req: AIMessageDraftRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Contract endpoint: Request AI-drafted outreach message (Email / WhatsApp / LinkedIn).
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")
    check_lead_access(lead, current_user)
    return generate_message_draft(lead, req)


@router.get("/daily-manager", response_model=AIDailyManagerResponse)
def get_ai_daily_manager_endpoint(
    specialist: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Contract endpoint: Daily Manager prioritized agenda.
    Employees see only their assigned accounts. Admins can view for any specialist or team-wide.
    """
    if current_user.role == UserRole.EMPLOYEE:
        filter_specialist = current_user.full_name
    else:
        filter_specialist = specialist

    return get_daily_manager_brief(db, filter_specialist)


@router.get("/duplicates/analyze", response_model=AIDuplicateAnalysisResponse)
def analyze_ai_duplicates_endpoint(
    email: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    fullName: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Contract endpoint: Intelligent duplicate detector before lead creation or stage progression.
    """
    return run_ai_duplicate_analysis(db, email=email, phone=phone, company=company, full_name=fullName)
