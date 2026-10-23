from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any


class WebsiteLeadWebhookPayload(BaseModel):
    fullName: str = Field(..., alias="name")
    company: str
    email: EmailStr
    phone: Optional[str] = ""
    leadSource: Optional[str] = "Website"
    notes: Optional[str] = ""
    assignedEmployee: Optional[str] = "Pavan Kumar"

    class Config:
        populate_by_name = True


class MetaLeadFieldData(BaseModel):
    name: str
    values: List[str]


class MetaLeadEntry(BaseModel):
    id: str
    time: int
    changes: List[Dict[str, Any]]


class MetaLeadWebhookPayload(BaseModel):
    object: Optional[str] = "page"
    entry: List[MetaLeadEntry]


class WhatsAppMessageValue(BaseModel):
    from_number: str = Field(..., alias="from")
    id: str
    timestamp: str
    text: Dict[str, str]

    class Config:
        populate_by_name = True


class WhatsAppWebhookPayload(BaseModel):
    object: Optional[str] = "whatsapp_business_account"
    messages: Optional[List[WhatsAppMessageValue]] = []
    sender: Optional[str] = None
    body: Optional[str] = None


class CalendarSyncEventRequest(BaseModel):
    leadId: str
    title: str
    description: Optional[str] = ""
    startTime: str  # ISO string or YYYY-MM-DD HH:MM
    durationMinutes: int = 45
    attendeeEmail: EmailStr
    assignedEmployee: Optional[str] = "Pavan Kumar"


class CalendarSyncEventResponse(BaseModel):
    success: bool
    provider: str
    eventId: str
    eventUrl: str
    status: str
    message: str


class EmailSyncInteractionRequest(BaseModel):
    leadId: str
    subject: str
    fromEmail: EmailStr
    toEmail: EmailStr
    bodySnippet: str
    timestamp: Optional[str] = None


class EmailSyncInteractionResponse(BaseModel):
    success: bool
    activityId: str
    provider: str
    message: str


class ProviderStatus(BaseModel):
    provider: str
    category: str
    isConfigured: bool
    isOperational: bool
    statusDescription: str
    endpoint: Optional[str] = None


class IntegrationStatusResponse(BaseModel):
    providers: List[ProviderStatus]
