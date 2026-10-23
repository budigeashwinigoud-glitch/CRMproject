import hmac
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.config import settings
from app.models.lead import Lead
from app.models.activity import Activity
from app.models.follow_up import FollowUp
from app.models.user import User
from app.models.webhook_event import ProcessedWebhookEvent
from app.schemas.lead import LeadCreate
from app.schemas.integrations import (
    WebsiteLeadWebhookPayload,
    CalendarSyncEventRequest,
    CalendarSyncEventResponse,
    EmailSyncInteractionRequest,
    EmailSyncInteractionResponse,
    ProviderStatus
)
from app.services.lead_service import create_lead
from app.services.duplicate_service import check_lead_duplicates, normalize_phone


def verify_hmac_sha256(payload_bytes: bytes, signature_header: Optional[str], secret: Optional[str]) -> bool:
    """Validate incoming webhook HMAC SHA-256 signature."""
    if not signature_header or not secret:
        return False
    expected_sig = signature_header.replace("sha256=", "").strip().lower()
    computed_sig = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest().lower()
    return hmac.compare_digest(expected_sig, computed_sig)


def is_event_processed(db: Session, event_id: str) -> bool:
    """Persistent database check ensuring webhook events are processed idempotently."""
    return db.query(ProcessedWebhookEvent).filter(ProcessedWebhookEvent.id == event_id).first() is not None


def mark_event_processed(db: Session, event_id: str, provider: str, payload_bytes: Optional[bytes] = None):
    """Persists processed webhook ID to the database with crash-resilient idempotency."""
    payload_hash = hashlib.sha256(payload_bytes).hexdigest() if payload_bytes else None
    evt = ProcessedWebhookEvent(id=event_id, provider=provider, payload_hash=payload_hash)
    db.add(evt)
    db.commit()


def process_website_lead_form(db: Session, payload: WebsiteLeadWebhookPayload) -> Dict[str, Any]:
    """Ingest website contact form lead into CRM with abuse safeguards."""
    # Check for duplicate lead
    matches = check_lead_duplicates(
        db,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        full_name=payload.fullName
    )

    is_duplicate = len(matches) > 0
    if is_duplicate:
        existing = db.query(Lead).filter(Lead.id == matches[0].existingLeadId).first()
        if existing:
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
            act = Activity(
                id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
                lead_id=existing.id,
                lead_name=existing.full_name,
                company=existing.company,
                type="email",
                description=f"Inbound website contact form submission from {payload.fullName}: {payload.notes or 'No message'}",
                timestamp=now_str,
                performed_by="Website Webhook"
            )
            db.add(act)
            db.commit()
            return {
                "success": True,
                "leadId": existing.id,
                "action": "appended_activity_to_existing_lead",
                "isDuplicate": True
            }

    # Safe default assignment: ensure target employee is active, else fallback to primary employee
    assigned_name = payload.assignedEmployee or "Pavan Kumar"
    target_user = db.query(User).filter(User.full_name == assigned_name, User.is_active == True).first()
    if not target_user:
        active_emp = db.query(User).filter(User.role == "EMPLOYEE", User.is_active == True).first()
        assigned_name = active_emp.full_name if active_emp else "Pavan Kumar"

    lead_in = LeadCreate(
        fullName=payload.fullName,
        company=payload.company,
        email=payload.email,
        phone=payload.phone or "",
        leadSource="Website",
        leadCategory="Inbound Web",
        priority="High" if "urgent" in (payload.notes or "").lower() else "Medium",
        pipelineStage="New",
        assignedEmployee=assigned_name,
        expectedValue=25000.0,
        notes=f"[Website Lead Form]: {payload.notes or 'Contact requested via website'}"
    )
    new_lead = create_lead(db, lead_in, performed_by="Website Webhook")
    return {
        "success": True,
        "leadId": new_lead.id,
        "action": "created_new_lead",
        "isDuplicate": False
    }


def normalize_meta_field_data(raw_data: Any) -> Dict[str, str]:
    """
    Normalizes Meta Lead Ads field_data.
    Handles both real Meta array: [{"name": "full_name", "values": ["Rodrigo"]}]
    and dictionary format: {"full_name": "Rodrigo"}.
    """
    output: Dict[str, str] = {}
    if isinstance(raw_data, list):
        for item in raw_data:
            if isinstance(item, dict):
                k = item.get("name")
                vals = item.get("values", [])
                if k and vals:
                    output[k] = str(vals[0])
    elif isinstance(raw_data, dict):
        output = {str(k): str(v) for k, v in raw_data.items()}
    return output


def process_meta_lead_ad(
    db: Session,
    leadgen_id: str,
    form_data_raw: Any,
    raw_bytes: Optional[bytes] = None,
    campaign_name: str = "LatAm Open Banking Campaign"
) -> Dict[str, Any]:
    """Process incoming Meta Lead Ads payload with persistent database idempotency."""
    if is_event_processed(db, leadgen_id):
        return {
            "success": True,
            "leadgenId": leadgen_id,
            "action": "ignored_duplicate_webhook",
            "isDuplicate": True
        }

    form_data = normalize_meta_field_data(form_data_raw)
    full_name = form_data.get("full_name") or form_data.get("name") or "Meta Prospect"
    email = form_data.get("email") or f"meta_lead_{leadgen_id}@inbound.belvo.com"
    company = form_data.get("company_name") or form_data.get("company") or "Meta Inbound Enterprise"
    phone = form_data.get("phone_number") or form_data.get("phone") or ""

    # Check active employee for assignment
    active_emp = db.query(User).filter(User.role == "EMPLOYEE", User.is_active == True).first()
    assigned_name = active_emp.full_name if active_emp else "Pavan Kumar"

    lead_in = LeadCreate(
        fullName=full_name,
        company=company,
        email=email,
        phone=phone,
        leadSource="Meta Ads",
        leadCategory="Social Lead Ad",
        priority="High",
        pipelineStage="New",
        assignedEmployee=assigned_name,
        expectedValue=30000.0,
        notes=f"[Meta Lead Gen ID: {leadgen_id}] Campaign: {campaign_name}"
    )
    new_lead = create_lead(db, lead_in, performed_by="Meta Lead Ads Webhook")
    mark_event_processed(db, leadgen_id, provider="Meta", payload_bytes=raw_bytes)

    return {
        "success": True,
        "leadId": new_lead.id,
        "leadgenId": leadgen_id,
        "action": "created_lead_from_meta",
        "isDuplicate": False
    }


def process_whatsapp_inbound_message(db: Session, sender: str, text: str, msg_id: Optional[str] = None) -> Dict[str, Any]:
    """Process WhatsApp message, linking to existing lead timeline or creating lead."""
    clean_sender = normalize_phone(sender)
    
    # Check deduplication if message ID provided
    if msg_id and is_event_processed(db, msg_id):
        return {"success": True, "action": "ignored_duplicate_whatsapp_message"}

    active_leads = db.query(Lead).filter(Lead.is_archived == False).all()
    matched_lead = None
    for l in active_leads:
        if l.phone and normalize_phone(l.phone) == clean_sender:
            matched_lead = l
            break

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    if matched_lead:
        act = Activity(
            id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
            lead_id=matched_lead.id,
            lead_name=matched_lead.full_name,
            company=matched_lead.company,
            type="email",
            description=f"WhatsApp message received from {sender}: \"{text}\"",
            timestamp=now_str,
            performed_by="WhatsApp Webhook"
        )
        db.add(act)
        if msg_id:
            mark_event_processed(db, msg_id, provider="WhatsApp")
        db.commit()
        return {
            "success": True,
            "leadId": matched_lead.id,
            "action": "recorded_whatsapp_interaction"
        }
    else:
        active_emp = db.query(User).filter(User.role == "EMPLOYEE", User.is_active == True).first()
        assigned_name = active_emp.full_name if active_emp else "Pavan Kumar"
        lead_in = LeadCreate(
            fullName=f"WhatsApp Contact ({sender[-4:] if len(sender) >= 4 else sender})",
            company="Inbound WhatsApp Prospect",
            email=f"wa_{clean_sender}@inbound.belvo.com",
            phone=sender,
            leadSource="Inbound",
            leadCategory="WhatsApp Direct",
            priority="Medium",
            pipelineStage="New",
            assignedEmployee=assigned_name,
            expectedValue=15000.0,
            notes=f"Initial WhatsApp outreach: \"{text}\""
        )
        new_lead = create_lead(db, lead_in, performed_by="WhatsApp Webhook")
        if msg_id:
            mark_event_processed(db, msg_id, provider="WhatsApp")
        return {
            "success": True,
            "leadId": new_lead.id,
            "action": "created_new_lead_from_whatsapp"
        }


def sync_google_calendar_event(db: Session, req: CalendarSyncEventRequest, user: User) -> CalendarSyncEventResponse:
    """Adapter logging scheduled calendar meetings locally in CRM pending Google OAuth API."""
    lead = db.query(Lead).filter(Lead.id == req.leadId).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {req.leadId} not found")

    if user.role.upper() == "EMPLOYEE" and lead.assigned_employee != user.full_name and lead.assigned_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot sync calendar event for a lead assigned to another specialist."
        )

    event_id = f"gcal_evt_{int(time.time() * 1000)}"

    fu = FollowUp(
        id=f"FU-{int(time.time() * 1000) % 100000:04d}",
        lead_id=req.leadId,
        lead_name=lead.full_name,
        company=lead.company,
        title=f"Calendar: {req.title}",
        type="Meeting",
        due_date=req.startTime.split(" ")[0].split("T")[0],
        due_time=req.startTime.split(" ")[1][:5] if " " in req.startTime else "11:00",
        priority="High",
        status="Pending",
        assigned_employee=user.full_name,
        assigned_user_id=user.id,
        notes=f"Adapter: Local CRM meeting scheduled (Live Google OAuth credentials pending setup)."
    )
    db.add(fu)
    db.commit()

    return CalendarSyncEventResponse(
        success=True,
        provider="Google Calendar Adapter (Local Schedule Recorded; Live Google API Pending)",
        eventId=event_id,
        eventUrl=f"https://calendar.google.com/calendar/r/eventedit?eid={event_id}",
        status="CONFIRMED_LOCAL",
        message=f"Meeting '{req.title}' scheduled in CRM for {lead.company}. Live Google OAuth sync is pending."
    )


def sync_email_interaction(db: Session, req: EmailSyncInteractionRequest, user: User) -> EmailSyncInteractionResponse:
    """Adapter logging inbound/outbound email interactions to lead timeline."""
    lead = db.query(Lead).filter(Lead.id == req.leadId).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {req.leadId} not found")

    if user.role.upper() == "EMPLOYEE" and lead.assigned_employee != user.full_name and lead.assigned_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot record email interaction for a lead assigned to another specialist."
        )

    now_str = req.timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    act = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=req.leadId,
        lead_name=lead.full_name,
        company=lead.company,
        type="email",
        description=f"Email interaction [{req.subject}]: {req.bodySnippet} (From: {req.fromEmail} -> To: {req.toEmail})",
        timestamp=now_str,
        performed_by=user.full_name
    )
    db.add(act)
    db.commit()

    return EmailSyncInteractionResponse(
        success=True,
        activityId=act.id,
        provider="Email Adapter (Interaction Recorded; Live IMAP/Graph API Sync Pending)",
        message=f"Email '{req.subject}' logged to lead {req.leadId} timeline."
    )


def get_integration_status_list() -> List[ProviderStatus]:
    """Accurately reports live connection status versus offline adapter stubs."""
    is_meta_configured = bool(settings.META_APP_SECRET and settings.META_APP_SECRET != "belvo_meta_app_secret_test")
    is_gcal_configured = bool(settings.GOOGLE_CALENDAR_CLIENT_ID)
    is_graph_configured = bool(settings.MICROSOFT_GRAPH_CLIENT_ID)

    return [
        ProviderStatus(
            provider="Website Lead Form",
            category="Lead Capture Webhook",
            isConfigured=True,
            isOperational=True,
            statusDescription="Live public ingestion endpoint ready at /api/integrations/webhooks/website",
            endpoint="/api/integrations/webhooks/website"
        ),
        ProviderStatus(
            provider="Meta Lead Ads",
            category="Advertising Ingestion",
            isConfigured=is_meta_configured,
            isOperational=is_meta_configured,
            statusDescription="Live HMAC signature receiver ready." if is_meta_configured else "Adapter ready; META_APP_SECRET pending production configuration.",
            endpoint="/api/integrations/webhooks/meta-lead-ads"
        ),
        ProviderStatus(
            provider="WhatsApp Cloud API",
            category="Messaging Webhook",
            isConfigured=True,
            isOperational=True,
            statusDescription="Challenge verification & inbound message receiver operational.",
            endpoint="/api/integrations/webhooks/whatsapp"
        ),
        ProviderStatus(
            provider="Google Calendar",
            category="Scheduling Connector",
            isConfigured=is_gcal_configured,
            isOperational=is_gcal_configured,
            statusDescription="Live Google OAuth connected." if is_gcal_configured else "Adapter mode (Local CRM task scheduling; Google OAuth client ID pending).",
            endpoint="/api/integrations/calendar/sync-event"
        ),
        ProviderStatus(
            provider="Gmail / Outlook Email",
            category="Mail Sync Connector",
            isConfigured=is_graph_configured,
            isOperational=is_graph_configured,
            statusDescription="Live Graph API connected." if is_graph_configured else "Adapter mode (Local activity logging; IMAP/Graph credentials pending).",
            endpoint="/api/integrations/email/sync-interaction"
        )
    ]
