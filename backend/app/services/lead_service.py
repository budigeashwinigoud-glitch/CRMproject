import time
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.lead import Lead
from app.models.activity import Activity
from app.models.follow_up import FollowUp
from app.models.pipeline_stage import PipelineStage
from app.schemas.lead import LeadCreate, LeadUpdate


def generate_lead_id() -> str:
    return f"LEAD-{int(time.time() * 1000) % 100000:04d}"


def get_leads(
    db: Session,
    search: Optional[str] = None,
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    source: Optional[str] = None,
    employee: Optional[str] = None,
    include_archived: bool = False,
    sort_by: str = "createdDate",
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[Lead], int]:
    query = db.query(Lead)

    if not include_archived:
        query = query.filter(Lead.is_archived == False)

    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Lead.full_name.ilike(search_pattern),
                Lead.company.ilike(search_pattern),
                Lead.email.ilike(search_pattern),
                Lead.phone.ilike(search_pattern),
                Lead.id.ilike(search_pattern)
            )
        )

    if stage and stage != "All":
        query = query.filter(Lead.pipeline_stage == stage)

    if priority and priority != "All":
        query = query.filter(Lead.priority == priority)

    if source and source != "All":
        query = query.filter(Lead.lead_source == source)

    if employee and employee != "All":
        query = query.filter(Lead.assigned_employee == employee)

    total_count = query.count()

    # Sorting map
    sort_col_map = {
        "createdDate": Lead.created_date,
        "company": Lead.company,
        "fullName": Lead.full_name,
        "priority": Lead.priority,
        "expectedValue": Lead.expected_value,
        "pipelineStage": Lead.pipeline_stage,
        "nextFollowUpDate": Lead.next_follow_up_date
    }
    col = sort_col_map.get(sort_by, Lead.created_date)
    query = query.order_by(desc(col) if sort_order.lower() == "desc" else asc(col))

    leads = query.offset(skip).limit(limit).all()
    return leads, total_count


def create_lead(db: Session, lead_in: LeadCreate, performed_by: str = "Pavan Kumar") -> Lead:
    new_id = generate_lead_id()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    lead = Lead(
        id=new_id,
        full_name=lead_in.full_name,
        company=lead_in.company,
        email=lead_in.email,
        phone=lead_in.phone or "",
        lead_source=lead_in.lead_source or "Website",
        lead_category=lead_in.lead_category or "Enterprise Banking",
        priority=lead_in.priority or "Medium",
        pipeline_stage=lead_in.pipeline_stage or "New",
        assigned_employee=lead_in.assigned_employee or "Pavan Kumar",
        assigned_user_id=lead_in.assigned_user_id,
        expected_value=float(lead_in.expected_value or 0.0),
        currency=lead_in.currency or "USD",
        notes=lead_in.notes or "",
        website=lead_in.website or "",
        location=lead_in.location or "",
        created_date=lead_in.created_date or today_str,
        next_follow_up_date=lead_in.next_follow_up_date or "",
        ai_score=lead_in.ai_score if lead_in.ai_score is not None else 75,
        ai_summary=lead_in.ai_summary or "Lead newly registered into CRM pipeline.",
        is_archived=False
    )
    db.add(lead)
    db.flush()

    # Log Activity
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="lead_created",
        description=f"New lead created ({lead.company}) with priority {lead.priority}",
        timestamp=now_str,
        performed_by=performed_by
    )
    db.add(activity)

    # Automatically create initial follow-up task if next_follow_up_date is supplied
    if lead.next_follow_up_date:
        follow_up = FollowUp(
            id=f"FU-{int(time.time() * 1000) % 100000:04d}",
            lead_id=lead.id,
            lead_name=lead.full_name,
            company=lead.company,
            title=f"Initial outreach for {lead.company}",
            type="Call",
            due_date=lead.next_follow_up_date,
            due_time="10:00",
            priority=lead.priority or "Medium",
            status="Pending",
            assigned_employee=lead.assigned_employee or "Pavan Kumar",
            assigned_user_id=lead.assigned_user_id,
            notes=f"Follow up regarding: {lead.notes or 'Initial inquiry'}"
        )
        db.add(follow_up)

    db.commit()
    db.refresh(lead)
    return lead


def update_lead(db: Session, lead: Lead, lead_in: LeadUpdate, performed_by: str = "Pavan Kumar") -> Lead:
    previous_stage = lead.pipeline_stage

    update_data = lead_in.model_dump(exclude_unset=True, by_alias=False)
    for field, value in update_data.items():
        if field == "expected_value" and value is not None:
            setattr(lead, field, float(value))
        elif value is not None:
            setattr(lead, field, value)

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    if previous_stage != lead.pipeline_stage:
        activity = Activity(
            id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
            lead_id=lead.id,
            lead_name=lead.full_name,
            company=lead.company,
            type="stage_change",
            description=f"Stage moved from {previous_stage} → {lead.pipeline_stage} (${lead.expected_value:,.0f})",
            timestamp=now_str,
            performed_by=performed_by
        )
        db.add(activity)
    else:
        activity = Activity(
            id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
            lead_id=lead.id,
            lead_name=lead.full_name,
            company=lead.company,
            type="note",
            description=f"Lead profile updated for {lead.company}",
            timestamp=now_str,
            performed_by=performed_by
        )
        db.add(activity)

    db.commit()
    db.refresh(lead)
    return lead


def update_lead_stage(db: Session, lead: Lead, new_stage: str, performed_by: str = "Pavan Kumar") -> Lead:
    old_stage = lead.pipeline_stage
    if old_stage == new_stage:
        return lead

    # Verify stage exists
    stage_exists = db.query(PipelineStage).filter(PipelineStage.id == new_stage).first()
    if not stage_exists:
        # Create pipeline stage record dynamically if it doesn't exist
        stage_record = PipelineStage(
            id=new_stage,
            label=new_stage,
            display_order=99,
            color="#64748b",
            is_active=True
        )
        db.add(stage_record)
        db.flush()

    lead.pipeline_stage = new_stage
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="stage_change",
        description=f"Pipeline stage updated: {old_stage} → {new_stage}",
        timestamp=now_str,
        performed_by=performed_by
    )
    db.add(activity)

    db.commit()
    db.refresh(lead)
    return lead


def archive_lead(db: Session, lead: Lead, performed_by: str = "Pavan Kumar") -> Lead:
    lead.is_archived = True
    lead.archived_at = datetime.now(timezone.utc)

    # Mark associated pending follow-ups
    follow_ups = db.query(FollowUp).filter(FollowUp.lead_id == lead.id).all()
    for fu in follow_ups:
        db.delete(fu)

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="note",
        description=f"Lead record for {lead.company} was archived.",
        timestamp=now_str,
        performed_by=performed_by
    )
    db.add(activity)

    db.commit()
    db.refresh(lead)
    return lead


def restore_lead(db: Session, lead: Lead, performed_by: str = "Pavan Kumar") -> Lead:
    lead.is_archived = False
    lead.archived_at = None

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    activity = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=lead.id,
        lead_name=lead.full_name,
        company=lead.company,
        type="note",
        description=f"Lead record for {lead.company} was restored from archive.",
        timestamp=now_str,
        performed_by=performed_by
    )
    db.add(activity)

    db.commit()
    db.refresh(lead)
    return lead
