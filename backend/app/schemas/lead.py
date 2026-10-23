from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class LeadBase(BaseModel):
    full_name: str = Field(..., alias="fullName")
    company: str
    email: EmailStr
    phone: Optional[str] = ""
    lead_source: Optional[str] = Field("Website", alias="leadSource")
    lead_category: Optional[str] = Field("Enterprise Banking", alias="leadCategory")
    priority: Optional[str] = "Medium"
    pipeline_stage: Optional[str] = Field("New", alias="pipelineStage")
    assigned_employee: Optional[str] = Field("Pavan Kumar", alias="assignedEmployee")
    assigned_user_id: Optional[int] = Field(None, alias="assignedUserId")
    expected_value: Optional[float] = Field(0.0, alias="expectedValue")
    currency: Optional[str] = "USD"
    notes: Optional[str] = ""
    website: Optional[str] = ""
    location: Optional[str] = ""
    created_date: Optional[str] = Field(None, alias="createdDate")
    next_follow_up_date: Optional[str] = Field(None, alias="nextFollowUpDate")
    ai_score: Optional[int] = Field(75, alias="aiScore")
    ai_summary: Optional[str] = Field("", alias="aiSummary")

    class Config:
        populate_by_name = True


class LeadCreate(BaseModel):
    full_name: str = Field(..., alias="fullName")
    company: str
    email: str
    phone: Optional[str] = ""
    lead_source: Optional[str] = Field("Website", alias="leadSource")
    lead_category: Optional[str] = Field("Enterprise Banking", alias="leadCategory")
    priority: Optional[str] = "Medium"
    pipeline_stage: Optional[str] = Field("New", alias="pipelineStage")
    assigned_employee: Optional[str] = Field("Pavan Kumar", alias="assignedEmployee")
    assigned_user_id: Optional[int] = Field(None, alias="assignedUserId")
    expected_value: Optional[float] = Field(0.0, alias="expectedValue")
    currency: Optional[str] = "USD"
    notes: Optional[str] = ""
    website: Optional[str] = ""
    location: Optional[str] = ""
    created_date: Optional[str] = Field(None, alias="createdDate")
    next_follow_up_date: Optional[str] = Field(None, alias="nextFollowUpDate")
    ai_score: Optional[int] = Field(75, alias="aiScore")
    ai_summary: Optional[str] = Field("", alias="aiSummary")

    class Config:
        populate_by_name = True


class LeadUpdate(BaseModel):
    full_name: Optional[str] = Field(None, alias="fullName")
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_source: Optional[str] = Field(None, alias="leadSource")
    lead_category: Optional[str] = Field(None, alias="leadCategory")
    priority: Optional[str] = None
    pipeline_stage: Optional[str] = Field(None, alias="pipelineStage")
    assigned_employee: Optional[str] = Field(None, alias="assignedEmployee")
    assigned_user_id: Optional[int] = Field(None, alias="assignedUserId")
    expected_value: Optional[float] = Field(None, alias="expectedValue")
    currency: Optional[str] = None
    notes: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    next_follow_up_date: Optional[str] = Field(None, alias="nextFollowUpDate")
    ai_score: Optional[int] = Field(None, alias="aiScore")
    ai_summary: Optional[str] = Field(None, alias="aiSummary")

    class Config:
        populate_by_name = True


class LeadStageUpdate(BaseModel):
    stage: str


class LeadAssignmentUpdate(BaseModel):
    assigned_employee: str = Field(..., alias="assignedEmployee")
    assigned_user_id: Optional[int] = Field(None, alias="assignedUserId")

    class Config:
        populate_by_name = True


class LeadResponse(BaseModel):
    id: str
    fullName: str
    company: str
    email: str
    phone: Optional[str] = ""
    leadSource: Optional[str] = "Website"
    leadCategory: Optional[str] = "Enterprise Banking"
    priority: Optional[str] = "Medium"
    pipelineStage: Optional[str] = "New"
    assignedEmployee: Optional[str] = "Pavan Kumar"
    assignedUserId: Optional[int] = None
    expectedValue: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    notes: Optional[str] = ""
    website: Optional[str] = ""
    location: Optional[str] = ""
    createdDate: Optional[str] = ""
    nextFollowUpDate: Optional[str] = ""
    aiScore: Optional[int] = 75
    aiSummary: Optional[str] = ""
    isArchived: Optional[bool] = False
    archivedAt: Optional[datetime] = None

    @classmethod
    def from_orm_model(cls, lead):
        return cls(
            id=lead.id,
            fullName=lead.full_name,
            company=lead.company,
            email=lead.email,
            phone=lead.phone or "",
            leadSource=lead.lead_source or "Website",
            leadCategory=lead.lead_category or "Enterprise Banking",
            priority=lead.priority or "Medium",
            pipelineStage=lead.pipeline_stage or "New",
            assignedEmployee=lead.assigned_employee or "Pavan Kumar",
            assignedUserId=lead.assigned_user_id,
            expectedValue=lead.expected_value or 0.0,
            currency=lead.currency or "USD",
            notes=lead.notes or "",
            website=lead.website or "",
            location=lead.location or "",
            createdDate=lead.created_date or "",
            nextFollowUpDate=lead.next_follow_up_date or "",
            aiScore=lead.ai_score or 75,
            aiSummary=lead.ai_summary or "",
            isArchived=lead.is_archived or False,
            archivedAt=lead.archived_at
        )

    class Config:
        from_attributes = True
