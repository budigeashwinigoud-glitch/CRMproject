from typing import List, Optional
from datetime import datetime, timezone
import time
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lead import Lead
from app.models.activity import Activity
from app.models.note import Note
from app.models.user import User
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadStageUpdate,
    LeadAssignmentUpdate,
    LeadResponse
)
from app.schemas.activity import ActivityResponse, ActivityCreate
from app.schemas.note import NoteResponse, NoteCreate
from app.schemas.import_export import DuplicateCheckRequest, DuplicateCheckResponse
from app.services.lead_service import (
    get_leads,
    create_lead,
    update_lead,
    update_lead_stage,
    archive_lead,
    restore_lead
)
from app.services.duplicate_service import check_lead_duplicates
from app.services.auth_service import get_current_user_optional, get_current_user

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("", response_model=List[LeadResponse])
def list_leads(
    search: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    employee: Optional[str] = Query(None),
    include_archived: bool = Query(False),
    sort_by: str = Query("createdDate"),
    sort_order: str = Query("desc"),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # If authenticated as employee and not admin, filter to assigned leads if employee isolation requested
    filter_employee = employee
    if current_user and current_user.role.upper() == "EMPLOYEE" and not employee:
        filter_employee = current_user.full_name

    leads, _ = get_leads(
        db=db,
        search=search,
        stage=stage,
        priority=priority,
        source=source,
        employee=filter_employee,
        include_archived=include_archived,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )
    return [LeadResponse.from_orm_model(l) for l in leads]


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def add_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    performer = current_user.full_name if current_user else (lead_in.assigned_employee or "Ashwini Sharma")
    new_lead = create_lead(db, lead_in, performed_by=performer)
    return LeadResponse.from_orm_model(new_lead)


@router.post("/duplicates/check", response_model=DuplicateCheckResponse)
def check_duplicates(
    req: DuplicateCheckRequest,
    db: Session = Depends(get_db)
):
    matches = check_lead_duplicates(
        db,
        email=req.email,
        phone=req.phone,
        company=req.company,
        full_name=req.fullName
    )
    return DuplicateCheckResponse(
        isDuplicate=len(matches) > 0,
        potentialMatches=matches
    )


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    if current_user and current_user.role.upper() == "EMPLOYEE":
        if lead.assigned_employee != current_user.full_name and lead.assigned_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: This lead is assigned to another team specialist."
            )

    return LeadResponse.from_orm_model(lead)


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead_full(
    lead_id: str,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    performer = current_user.full_name if current_user else (lead.assigned_employee or "Ashwini Sharma")
    updated = update_lead(db, lead, lead_in, performed_by=performer)
    return LeadResponse.from_orm_model(updated)


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead_partial(
    lead_id: str,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    performer = current_user.full_name if current_user else (lead.assigned_employee or "Ashwini Sharma")
    updated = update_lead(db, lead, lead_in, performed_by=performer)
    return LeadResponse.from_orm_model(updated)


@router.delete("/{lead_id}", status_code=status.HTTP_200_OK)
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    performer = current_user.full_name if current_user else "Ashwini Sharma"
    archive_lead(db, lead, performed_by=performer)
    return {"success": True, "message": f"Lead {lead_id} archived successfully."}


@router.post("/{lead_id}/archive", response_model=LeadResponse)
def archive_lead_endpoint(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    performer = current_user.full_name if current_user else "Ashwini Sharma"
    archived = archive_lead(db, lead, performed_by=performer)
    return LeadResponse.from_orm_model(archived)


@router.post("/{lead_id}/restore", response_model=LeadResponse)
def restore_lead_endpoint(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    performer = current_user.full_name if current_user else "Ashwini Sharma"
    restored = restore_lead(db, lead, performed_by=performer)
    return LeadResponse.from_orm_model(restored)


@router.patch("/{lead_id}/stage", response_model=LeadResponse)
def change_lead_stage(
    lead_id: str,
    body: LeadStageUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    performer = current_user.full_name if current_user else (lead.assigned_employee or "Ashwini Sharma")
    updated = update_lead_stage(db, lead, body.stage, performed_by=performer)
    return LeadResponse.from_orm_model(updated)


@router.patch("/{lead_id}/assignment", response_model=LeadResponse)
def change_lead_assignment(
    lead_id: str,
    body: LeadAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

    prev_emp = lead.assigned_employee
    lead.assigned_employee = body.assigned_employee
    if body.assigned_user_id is not None:
        lead.assigned_user_id = body.assigned_user_id

    performer = current_user.full_name if current_user else "Admin"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="note",
        description=f"Lead reassigned from {prev_emp} to {lead.assigned_employee}",
        timestamp=now_str,
        performed_by=performer
    )
    db.add(activity)
    db.commit()
    db.refresh(lead)
    return LeadResponse.from_orm_model(lead)


@router.get("/{lead_id}/activities", response_model=List[ActivityResponse])
def get_lead_activities(lead_id: str, db: Session = Depends(get_db)):
    acts = db.query(Activity).filter(Activity.lead_id == lead_id).order_by(Activity.created_at.desc()).all()
    return [ActivityResponse.from_orm_model(a) for a in acts]


@router.post("/{lead_id}/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def add_lead_activity(
    lead_id: str,
    act_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    performer = current_user.full_name if current_user else (act_in.performed_by or "Ashwini Sharma")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    act = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=lead_id,
        lead_name=lead.full_name if lead else (act_in.lead_name or ""),
        company=lead.company if lead else (act_in.company or ""),
        type=act_in.type or "note",
        description=act_in.description,
        timestamp=act_in.timestamp or now_str,
        performed_by=performer
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return ActivityResponse.from_orm_model(act)


@router.get("/{lead_id}/notes", response_model=List[NoteResponse])
def get_lead_notes(lead_id: str, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.lead_id == lead_id).order_by(Note.created_at.desc()).all()
    return [NoteResponse.from_orm_model(n) for n in notes]


@router.post("/{lead_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def add_lead_note(
    lead_id: str,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    author = current_user.full_name if current_user else (note_in.author_name or "Ashwini Sharma")
    author_id = current_user.id if current_user else None
    note = Note(
        lead_id=lead_id,
        author_id=author_id,
        author_name=author,
        content=note_in.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteResponse.from_orm_model(note)
