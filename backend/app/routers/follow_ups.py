from typing import List, Optional
from datetime import datetime, timezone
import time
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.follow_up import FollowUp
from app.models.lead import Lead
from app.models.activity import Activity
from app.models.user import User
from app.schemas.follow_up import (
    FollowUpCreate,
    FollowUpUpdate,
    FollowUpStatusUpdate,
    FollowUpResponse
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/follow-ups", tags=["Follow-ups"])


def check_follow_up_access(fu: FollowUp, current_user: User):
    """Enforces record-level authorization on follow-up tasks."""
    if current_user.role.upper() == "EMPLOYEE":
        if fu.assigned_employee != current_user.full_name and fu.assigned_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: This follow-up is assigned to another team specialist."
            )


@router.get("", response_model=List[FollowUpResponse])
def get_follow_ups(
    status: Optional[str] = Query(None),
    employee: Optional[str] = Query(None),
    lead_id: Optional[str] = Query(None, alias="leadId"),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FollowUp)

    # Enforce strict employee isolation
    if current_user.role.upper() == "EMPLOYEE":
        query = query.filter(FollowUp.assigned_employee == current_user.full_name)
    elif employee and employee != "All":
        query = query.filter(FollowUp.assigned_employee == employee)

    if status and status != "All":
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if status == "Overdue":
            query = query.filter(
                (FollowUp.status == "Overdue") |
                ((FollowUp.status == "Pending") & (FollowUp.due_date < today_str))
            )
        elif status == "Due Today":
            query = query.filter(FollowUp.due_date == today_str, FollowUp.status != "Completed")
        elif status == "Upcoming":
            query = query.filter(FollowUp.due_date > today_str, FollowUp.status != "Completed")
        elif status == "Completed":
            query = query.filter(FollowUp.status == "Completed")
        else:
            query = query.filter(FollowUp.status == status)

    if lead_id:
        query = query.filter(FollowUp.lead_id == lead_id)

    if priority and priority != "All":
        query = query.filter(FollowUp.priority == priority)

    items = query.order_by(FollowUp.due_date.asc()).all()
    return [FollowUpResponse.from_orm_model(fu) for fu in items]


@router.post("", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
def create_follow_up(
    fu_in: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_id = f"FU-{int(time.time() * 1000) % 100000:04d}"
    
    # If lead_id provided, verify lead existence and access
    lead = None
    if fu_in.lead_id:
        lead = db.query(Lead).filter(Lead.id == fu_in.lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail=f"Lead {fu_in.lead_id} not found")
        if current_user.role.upper() == "EMPLOYEE":
            if lead.assigned_employee != current_user.full_name and lead.assigned_user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot create follow-up for a lead assigned to another specialist."
                )

    company_name = fu_in.company or (lead.company if lead else "")
    contact_name = fu_in.lead_name or (lead.full_name if lead else "General Follow-up")
    
    if current_user.role.upper() == "EMPLOYEE":
        assigned = current_user.full_name
        assigned_id = current_user.id
    else:
        assigned = fu_in.assigned_employee or (lead.assigned_employee if lead else current_user.full_name)
        assigned_id = fu_in.assigned_user_id or current_user.id

    fu = FollowUp(
        id=new_id,
        lead_id=fu_in.lead_id,
        lead_name=contact_name,
        company=company_name,
        title=fu_in.title,
        type=fu_in.type or "Call",
        due_date=fu_in.due_date,
        due_time=fu_in.due_time or "10:00",
        priority=fu_in.priority or "Medium",
        status=fu_in.status or "Pending",
        assigned_employee=assigned,
        assigned_user_id=assigned_id,
        notes=fu_in.notes or ""
    )
    db.add(fu)

    # Activity log
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=fu.lead_id,
        lead_name=fu.lead_name,
        company=fu.company,
        type="task",
        description=f"Scheduled {fu.type} task: \"{fu.title}\" due {fu.due_date}",
        timestamp=now_str,
        performed_by=current_user.full_name
    )
    db.add(activity)

    db.commit()
    db.refresh(fu)
    return FollowUpResponse.from_orm_model(fu)


@router.get("/{follow_up_id}", response_model=FollowUpResponse)
def get_follow_up(
    follow_up_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fu = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    check_follow_up_access(fu, current_user)
    return FollowUpResponse.from_orm_model(fu)


@router.patch("/{follow_up_id}", response_model=FollowUpResponse)
def update_follow_up(
    follow_up_id: str,
    fu_in: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fu = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    check_follow_up_access(fu, current_user)

    if fu_in.title is not None:
        fu.title = fu_in.title
    if fu_in.type is not None:
        fu.type = fu_in.type
    if fu_in.due_date is not None:
        fu.due_date = fu_in.due_date
    if fu_in.due_time is not None:
        fu.due_time = fu_in.due_time
    if fu_in.priority is not None:
        fu.priority = fu_in.priority
    if fu_in.status is not None:
        fu.status = fu_in.status
        if fu.status == "Completed":
            fu.completed_at = datetime.now(timezone.utc)
    if current_user.role.upper() == "ADMIN":
        if fu_in.assigned_employee is not None:
            fu.assigned_employee = fu_in.assigned_employee
        if fu_in.assigned_user_id is not None:
            fu.assigned_user_id = fu_in.assigned_user_id
    if fu_in.notes is not None:
        fu.notes = fu_in.notes

    db.commit()
    db.refresh(fu)
    return FollowUpResponse.from_orm_model(fu)


@router.patch("/{follow_up_id}/status", response_model=FollowUpResponse)
def update_follow_up_status(
    follow_up_id: str,
    body: FollowUpStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fu = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    check_follow_up_access(fu, current_user)

    fu.status = body.status
    if body.status == "Completed":
        fu.completed_at = datetime.now(timezone.utc)

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=fu.lead_id,
        lead_name=fu.lead_name,
        company=fu.company,
        type="task",
        description=f"Follow-up \"{fu.title}\" marked as {fu.status}",
        timestamp=now_str,
        performed_by=current_user.full_name
    )
    db.add(activity)

    db.commit()
    db.refresh(fu)
    return FollowUpResponse.from_orm_model(fu)


@router.post("/{follow_up_id}/complete", response_model=FollowUpResponse)
def complete_follow_up(
    follow_up_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_follow_up_status(
        follow_up_id=follow_up_id,
        body=FollowUpStatusUpdate(status="Completed"),
        db=db,
        current_user=current_user
    )


@router.delete("/{follow_up_id}", status_code=status.HTTP_200_OK)
def delete_follow_up(
    follow_up_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fu = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    check_follow_up_access(fu, current_user)
    db.delete(fu)
    db.commit()
    return {"success": True, "message": f"Follow-up {follow_up_id} removed."}
