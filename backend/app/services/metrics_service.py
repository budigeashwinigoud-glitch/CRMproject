from datetime import datetime, timezone
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.models.follow_up import FollowUp
from app.models.pipeline_stage import PipelineStage
from app.schemas.dashboard import (
    DashboardMetricsResponse,
    StageBreakdownItem,
    SourceBreakdownItem,
    EmployeeMetricsResponse
)


def calculate_dashboard_metrics(db: Session, employee: Optional[str] = None) -> DashboardMetricsResponse:
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    leads_query = db.query(Lead).filter(Lead.is_archived == False)
    follow_ups_query = db.query(FollowUp)

    if employee and employee != "All":
        leads_query = leads_query.filter(Lead.assigned_employee == employee)
        follow_ups_query = follow_ups_query.filter(FollowUp.assigned_employee == employee)

    leads = leads_query.all()
    follow_ups = follow_ups_query.all()

    total_leads = len(leads)
    new_leads = sum(1 for l in leads if l.pipeline_stage == "New")
    qualified_leads = sum(1 for l in leads if l.pipeline_stage == "Qualified")
    in_progress_leads = sum(
        1 for l in leads if l.pipeline_stage in ["Contacted", "Qualified", "Meeting", "Proposal", "Negotiation"]
    )
    won_leads = sum(1 for l in leads if l.pipeline_stage == "Won")
    lost_leads = sum(1 for l in leads if l.pipeline_stage == "Lost")

    total_pipeline_val = sum(float(l.expected_value or 0.0) for l in leads)
    active_pipeline_val = sum(
        float(l.expected_value or 0.0) for l in leads if l.pipeline_stage not in ["Won", "Lost"]
    )
    won_val = sum(float(l.expected_value or 0.0) for l in leads if l.pipeline_stage == "Won")

    closed_count = won_leads + lost_leads
    if closed_count > 0:
        conversion_rate = int(round((won_leads / closed_count) * 100))
    elif total_leads > 0:
        conversion_rate = int(round((won_leads / total_leads) * 100))
    else:
        conversion_rate = 0

    pending_fu = [f for f in follow_ups if f.status != "Completed"]
    overdue_fu = sum(1 for f in pending_fu if f.due_date < today_str or f.status == "Overdue")
    upcoming_fu = sum(1 for f in pending_fu if f.due_date >= today_str)
    completed_fu = sum(1 for f in follow_ups if f.status == "Completed")

    # Pipeline stages
    db_stages = db.query(PipelineStage).filter(PipelineStage.is_active == True).order_by(PipelineStage.display_order).all()
    stage_breakdown: List[StageBreakdownItem] = []
    for s in db_stages:
        stage_leads = [l for l in leads if l.pipeline_stage == s.id]
        count = len(stage_leads)
        val = sum(float(l.expected_value or 0.0) for l in stage_leads)
        pct = int(round((count / total_leads) * 100)) if total_leads > 0 else 0
        stage_breakdown.append(StageBreakdownItem(
            id=s.id,
            label=s.label,
            color=s.color or "#64748b",
            count=count,
            value=val,
            percentage=pct
        ))

    # Sources breakdown
    src_counts: Dict[str, int] = {}
    for l in leads:
        src = l.lead_source or "Other"
        src_counts[src] = src_counts.get(src, 0) + 1

    source_breakdown = [
        SourceBreakdownItem(
            source=k,
            count=v,
            percentage=int(round((v / total_leads) * 100)) if total_leads > 0 else 0
        )
        for k, v in sorted(src_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    # Priority breakdown
    priority_counts = {"High": 0, "Medium": 0, "Low": 0}
    for l in leads:
        p = l.priority or "Medium"
        if p in priority_counts:
            priority_counts[p] += 1

    return DashboardMetricsResponse(
        totalLeads=total_leads,
        newLeads=new_leads,
        qualifiedLeads=qualified_leads,
        inProgressLeads=in_progress_leads,
        wonLeads=won_leads,
        lostLeads=lost_leads,
        totalPipelineValue=total_pipeline_val,
        activePipelineValue=active_pipeline_val,
        wonValue=won_val,
        conversionRate=conversion_rate,
        overdueFollowUps=overdue_fu,
        upcomingFollowUps=upcoming_fu,
        completedFollowUps=completed_fu,
        stageBreakdown=stage_breakdown,
        sourceBreakdown=source_breakdown,
        priorityCounts=priority_counts
    )


def calculate_employee_metrics(db: Session, employee: str) -> EmployeeMetricsResponse:
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    leads = db.query(Lead).filter(Lead.is_archived == False, Lead.assigned_employee == employee).all()
    follow_ups = db.query(FollowUp).filter(FollowUp.assigned_employee == employee).all()

    total_leads = len(leads)
    active_leads = sum(1 for l in leads if l.pipeline_stage not in ["Won", "Lost"])
    won_leads = sum(1 for l in leads if l.pipeline_stage == "Won")
    lost_leads = sum(1 for l in leads if l.pipeline_stage == "Lost")
    won_val = sum(float(l.expected_value or 0.0) for l in leads if l.pipeline_stage == "Won")
    active_val = sum(float(l.expected_value or 0.0) for l in leads if l.pipeline_stage not in ["Won", "Lost"])

    closed = won_leads + lost_leads
    conv_rate = int(round((won_leads / closed) * 100)) if closed > 0 else (int(round((won_leads / total_leads) * 100)) if total_leads > 0 else 0)

    pending_fu = [f for f in follow_ups if f.status != "Completed"]
    overdue_fu = sum(1 for f in pending_fu if f.due_date < today_str or f.status == "Overdue")

    db_stages = db.query(PipelineStage).filter(PipelineStage.is_active == True).order_by(PipelineStage.display_order).all()
    stage_breakdown: List[StageBreakdownItem] = []
    for s in db_stages:
        st_leads = [l for l in leads if l.pipeline_stage == s.id]
        count = len(st_leads)
        val = sum(float(l.expected_value or 0.0) for l in st_leads)
        pct = int(round((count / total_leads) * 100)) if total_leads > 0 else 0
        stage_breakdown.append(StageBreakdownItem(
            id=s.id,
            label=s.label,
            color=s.color or "#64748b",
            count=count,
            value=val,
            percentage=pct
        ))

    return EmployeeMetricsResponse(
        employee=employee,
        totalAssignedLeads=total_leads,
        activeLeads=active_leads,
        wonLeads=won_leads,
        wonValue=won_val,
        activePipelineValue=active_val,
        conversionRate=conv_rate,
        pendingFollowUps=len(pending_fu),
        overdueFollowUps=overdue_fu,
        stageBreakdown=stage_breakdown
    )
