from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FollowUpBase(BaseModel):
    lead_id: Optional[str] = Field(None, alias="leadId")
    lead_name: Optional[str] = Field(None, alias="leadName")
    company: Optional[str] = None
    title: str
    type: Optional[str] = "Call"  # 'Call', 'Meeting', 'Email', 'Task'
    due_date: str = Field(..., alias="dueDate")  # 'YYYY-MM-DD'
    due_time: Optional[str] = Field("10:00", alias="dueTime")
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"  # 'Pending', 'Completed', 'Overdue'
    assigned_employee: Optional[str] = Field("Ashwini Sharma", alias="assignedEmployee")
    assigned_user_id: Optional[int] = Field(None, alias="assignedUserId")
    notes: Optional[str] = ""

    class Config:
        populate_by_name = True


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    due_date: Optional[str] = Field(None, alias="dueDate")
    due_time: Optional[str] = Field(None, alias="dueTime")
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_employee: Optional[str] = Field(None, alias="assignedEmployee")
    assigned_user_id: Optional[int] = Field(None, alias="assignedUserId")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class FollowUpStatusUpdate(BaseModel):
    status: str  # 'Pending', 'Completed', 'Overdue'


class FollowUpResponse(BaseModel):
    id: str
    leadId: Optional[str] = ""
    leadName: Optional[str] = ""
    company: Optional[str] = ""
    title: str
    type: Optional[str] = "Call"
    dueDate: str
    dueTime: Optional[str] = "10:00"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"
    assignedEmployee: Optional[str] = "Ashwini Sharma"
    assignedUserId: Optional[int] = None
    notes: Optional[str] = ""
    completedAt: Optional[datetime] = None

    @classmethod
    def from_orm_model(cls, fu):
        return cls(
            id=fu.id,
            leadId=fu.lead_id or "",
            leadName=fu.lead_name or "",
            company=fu.company or "",
            title=fu.title,
            type=fu.type or "Call",
            dueDate=fu.due_date,
            dueTime=fu.due_time or "10:00",
            priority=fu.priority or "Medium",
            status=fu.status or "Pending",
            assignedEmployee=fu.assigned_employee or "Ashwini Sharma",
            assignedUserId=fu.assigned_user_id,
            notes=fu.notes or "",
            completedAt=fu.completed_at
        )

    class Config:
        from_attributes = True
