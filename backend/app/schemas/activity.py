from pydantic import BaseModel, Field
from typing import Optional


class ActivityBase(BaseModel):
    lead_id: Optional[str] = Field(None, alias="leadId")
    lead_name: Optional[str] = Field(None, alias="leadName")
    company: Optional[str] = None
    type: Optional[str] = "note"
    description: str
    timestamp: Optional[str] = None
    performed_by: Optional[str] = Field("Ashwini Sharma", alias="performedBy")

    class Config:
        populate_by_name = True


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(BaseModel):
    id: str
    leadId: Optional[str] = ""
    leadName: Optional[str] = ""
    company: Optional[str] = ""
    type: str
    description: str
    timestamp: str
    performedBy: str

    @classmethod
    def from_orm_model(cls, act):
        return cls(
            id=act.id,
            leadId=act.lead_id or "",
            leadName=act.lead_name or "",
            company=act.company or "",
            type=act.type or "note",
            description=act.description,
            timestamp=act.timestamp or "",
            performedBy=act.performed_by or "Ashwini Sharma"
        )

    class Config:
        from_attributes = True
