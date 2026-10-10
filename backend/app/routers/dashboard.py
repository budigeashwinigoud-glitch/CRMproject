from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import (
    DashboardMetricsResponse,
    EmployeeMetricsResponse,
    StageBreakdownItem,
    SourceBreakdownItem
)
from app.services.metrics_service import (
    calculate_dashboard_metrics,
    calculate_employee_metrics
)
from app.services.auth_service import get_current_user_optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_metrics(
    employee: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    filter_emp = employee
    if current_user and current_user.role.upper() == "EMPLOYEE":
        filter_emp = current_user.full_name

    return calculate_dashboard_metrics(db, employee=filter_emp)


@router.get("/employee-metrics", response_model=EmployeeMetricsResponse)
def get_emp_metrics(
    employee: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if current_user and current_user.role.upper() == "EMPLOYEE":
        target_emp = current_user.full_name
    else:
        target_emp = employee or (current_user.full_name if current_user else "Ashwini Sharma")

    return calculate_employee_metrics(db, employee=target_emp)


@router.get("/pipeline", response_model=List[StageBreakdownItem])
def get_pipeline_metrics(
    employee: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    filter_emp = employee
    if current_user and current_user.role.upper() == "EMPLOYEE":
        filter_emp = current_user.full_name
    metrics = calculate_dashboard_metrics(db, employee=filter_emp)
    return metrics.stageBreakdown


@router.get("/lead-sources", response_model=List[SourceBreakdownItem])
def get_lead_sources(
    employee: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    filter_emp = employee
    if current_user and current_user.role.upper() == "EMPLOYEE":
        filter_emp = current_user.full_name
    metrics = calculate_dashboard_metrics(db, employee=filter_emp)
    return metrics.sourceBreakdown
