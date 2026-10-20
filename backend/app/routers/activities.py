from typing import List, Optional
from datetime import datetime, timezone
import time
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.activity import Activity
from app.models.lead import Lead
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("", response_model=List[ActivityResponse])
def get_activities(
    lead_id: Optional[str] = Query(None, alias="leadId"),
    type: Optional[str] = Query(None),
    performed_by: Optional[str] = Query(None, alias="performedBy"),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Activity)

    # If employee, restrict activities to their assigned leads or performed by them
    if current_user.role.upper() == "EMPLOYEE":
        # Get assigned lead IDs
        assigned_lead_ids = [l.id for l in db.query(Lead.id).filter(
            (Lead.assigned_employee == current_user.full_name) | (Lead.assigned_user_id == current_user.id)
        ).all()]
        query = query.filter(
            (Activity.lead_id.in_(assigned_lead_ids)) | (Activity.performed_by == current_user.full_name)
        )
    elif performed_by and performed_by != "All":
        query = query.filter(Activity.performed_by == performed_by)

    if lead_id:
        # If employee, verify access to this specific lead
        if current_user.role.upper() == "EMPLOYEE":
            lead = db.query(Lead).filter(Lead.id == lead_id).first()
            if lead and lead.assigned_employee != current_user.full_name and lead.assigned_user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot view activities for a lead assigned to another specialist."
                )
        query = query.filter(Activity.lead_id == lead_id)

    if type and type != "All":
        query = query.filter(Activity.type == type)

    acts = query.order_by(Activity.created_at.desc()).limit(limit).all()
    return [ActivityResponse.from_orm_model(a) for a in acts]


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    act_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_id = f"ACT-{int(time.time() * 1000) % 100000:04d}"
    lead = None
    if act_in.lead_id:
        lead = db.query(Lead).filter(Lead.id == act_in.lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail=f"Lead {act_in.lead_id} not found")
        if current_user.role.upper() == "EMPLOYEE":
            if lead.assigned_employee != current_user.full_name and lead.assigned_user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot add activity to a lead assigned to another specialist."
                )

    company = act_in.company or (lead.company if lead else "")
    lead_name = act_in.lead_name or (lead.full_name if lead else "")
    performer = current_user.full_name
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")

    act = Activity(
        id=new_id,
        lead_id=act_in.lead_id,
        user_id=current_user.id,
        lead_name=lead_name,
        company=company,
        type=act_in.type or "note",
        description=act_in.description,
        timestamp=act_in.timestamp or now_str,
        performed_by=performer
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return ActivityResponse.from_orm_model(act)
