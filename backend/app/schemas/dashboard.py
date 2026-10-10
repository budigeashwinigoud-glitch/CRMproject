from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class StageBreakdownItem(BaseModel):
    id: str
    label: str
    color: str
    count: int
    value: float
    percentage: int


class SourceBreakdownItem(BaseModel):
    source: str
    count: int
    percentage: int


class DashboardMetricsResponse(BaseModel):
    totalLeads: int
    newLeads: int
    qualifiedLeads: int
    inProgressLeads: int
    wonLeads: int
    lostLeads: int
    totalPipelineValue: float
    activePipelineValue: float
    wonValue: float
    conversionRate: int
    overdueFollowUps: int
    upcomingFollowUps: int
    completedFollowUps: int
    stageBreakdown: List[StageBreakdownItem]
    sourceBreakdown: List[SourceBreakdownItem]
    priorityCounts: Dict[str, int]


class EmployeeMetricsResponse(BaseModel):
    employee: str
    totalAssignedLeads: int
    activeLeads: int
    wonLeads: int
    wonValue: float
    activePipelineValue: float
    conversionRate: int
    pendingFollowUps: int
    overdueFollowUps: int
    stageBreakdown: List[StageBreakdownItem]
