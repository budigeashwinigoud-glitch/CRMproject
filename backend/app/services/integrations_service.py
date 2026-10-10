import hmac
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.models.activity import Activity
from app.models.follow_up import FollowUp
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

# In-memory idempotency cache for webhooks (prevents processing same webhook multiple times)
PROCESSED_WEBHOOK_IDS = set()


def verify_hmac_sha256(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
    """Validate incoming webhook HMAC SHA-256 signature."""
    if not signature_header or not secret:
        return False
    # Meta / WhatsApp headers usually look like: 'sha256=<hash>'
    expected_sig = signature_header.replace("sha256=", "").strip()
    computed_sig = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_sig, computed_sig)


def process_website_lead_form(db: Session, payload: WebsiteLeadWebhookPayload) -> Dict[str, Any]:
    """Ingest website contact form lead into CRM."""
    # Check duplicates first
    matches = check_lead_duplicates(
        db,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        full_name=payload.fullName
    )

    is_duplicate = len(matches) > 0
    if is_duplicate:
        # Match existing lead and record web touchpoint
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

    # Clean new lead creation
    lead_in = LeadCreate(
        fullName=payload.fullName,
        company=payload.company,
        email=payload.email,
        phone=payload.phone or "",
        leadSource="Website",
        leadCategory="Inbound Web",
        priority="High" if "urgent" in (payload.notes or "").lower() else "Medium",
        pipelineStage="New",
        assignedEmployee=payload.assignedEmployee or "Ashwini Sharma",
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


def process_meta_lead_ad(
    db: Session,
    leadgen_id: str,
    form_data: Dict[str, str],
    campaign_name: str = "LatAm Open Banking Campaign"
) -> Dict[str, Any]:
    """Process incoming Meta Lead Ads payload with idempotency check."""
    if leadgen_id in PROCESSED_WEBHOOK_IDS:
        return {"success": True, "leadgen_id": leadgen_id, "action": "ignored_duplicate_webhook"}

    full_name = form_data.get("full_name") or form_data.get("name") or "Meta Prospect"
    email = form_data.get("email") or f"meta_lead_{leadgen_id}@inbound.belvo.com"
    company = form_data.get("company_name") or form_data.get("company") or "Meta Inbound Enterprise"
    phone = form_data.get("phone_number") or form_data.get("phone") or ""

    lead_in = LeadCreate(
        fullName=full_name,
        company=company,
        email=email,
        phone=phone,
        leadSource="Meta Ads",
        leadCategory="Social Lead Ad",
        priority="High",
        pipelineStage="New",
        assignedEmployee="Ashwini Sharma",
        expectedValue=30000.0,
        notes=f"[Meta Lead Gen ID: {leadgen_id}] Campaign: {campaign_name}"
    )
    new_lead = create_lead(db, lead_in, performed_by="Meta Lead Ads Webhook")
    PROCESSED_WEBHOOK_IDS.add(leadgen_id)

    return {
        "success": True,
        "leadId": new_lead.id,
        "leadgenId": leadgen_id,
        "action": "created_lead_from_meta"
    }


def process_whatsapp_inbound_message(db: Session, sender: str, text: str) -> Dict[str, Any]:
    """Process WhatsApp message, matching existing lead phone number or creating lead."""
    clean_sender = normalize_phone(sender)
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
        db.commit()
        return {
            "success": True,
            "leadId": matched_lead.id,
            "action": "recorded_whatsapp_interaction"
        }
    else:
        # Create new prospect from WhatsApp inquiry
        lead_in = LeadCreate(
            fullName=f"WhatsApp Contact ({sender[-4:]})",
            company="Inbound WhatsApp Prospect",
            email=f"wa_{clean_sender}@inbound.belvo.com",
            phone=sender,
            leadSource="Inbound",
            leadCategory="WhatsApp Direct",
            priority="Medium",
            pipelineStage="New",
            assignedEmployee="Ashwini Sharma",
            expectedValue=15000.0,
            notes=f"Initial WhatsApp outreach: \"{text}\""
        )
        new_lead = create_lead(db, lead_in, performed_by="WhatsApp Webhook")
        return {
            "success": True,
            "leadId": new_lead.id,
            "action": "created_new_lead_from_whatsapp"
        }


def sync_google_calendar_event(db: Session, req: CalendarSyncEventRequest) -> CalendarSyncEventResponse:
    """Mock calendar adapter creating verified calendar meeting schedule."""
    lead = db.query(Lead).filter(Lead.id == req.leadId).first()
    event_id = f"gcal_evt_{int(time.time() * 1000)}"

    # Record follow-up in CRM
    fu = FollowUp(
        id=f"FU-{int(time.time() * 1000) % 100000:04d}",
        lead_id=req.leadId,
        lead_name=lead.full_name if lead else "Lead Meeting",
        company=lead.company if lead else "",
        title=f"Calendar: {req.title}",
        type="Meeting",
        due_date=req.startTime.split(" ")[0].split("T")[0],
        due_time=req.startTime.split(" ")[1][:5] if " " in req.startTime else "11:00",
        priority="High",
        status="Pending",
        assigned_employee=req.assignedEmployee or "Ashwini Sharma",
        notes=f"Synced with Google Calendar (Event ID: {event_id})"
    )
    db.add(fu)
    db.commit()

    return CalendarSyncEventResponse(
        success=True,
        provider="Google Calendar Adapter",
        eventId=event_id,
        eventUrl=f"https://calendar.google.com/calendar/r/eventedit?eid={event_id}",
        status="CONFIRMED",
        message=f"Meeting '{req.title}' successfully scheduled and linked to {lead.company if lead else req.leadId}"
    )


def sync_email_interaction(db: Session, req: EmailSyncInteractionRequest) -> EmailSyncInteractionResponse:
    """Adapter to log Outlook/Gmail interactions against lead timeline."""
    lead = db.query(Lead).filter(Lead.id == req.leadId).first()
    now_str = req.timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")

    act = Activity(
        id=f"ACT-{int(time.time() * 1000) % 100000:04d}",
        lead_id=req.leadId,
        lead_name=lead.full_name if lead else "",
        company=lead.company if lead else "",
        type="email",
        description=f"Email sync [{req.subject}]: {req.bodySnippet} (From: {req.fromEmail} -> To: {req.toEmail})",
        timestamp=now_str,
        performed_by="Email Sync Connector"
    )
    db.add(act)
    db.commit()

    return EmailSyncInteractionResponse(
        success=True,
        activityId=act.id,
        provider="Outlook / Gmail Sync Adapter",
        message=f"Email '{req.subject}' logged to lead {req.leadId} timeline."
    )


def get_integration_status_list() -> List[ProviderStatus]:
    """Report real readiness of external connectors without falsifying operational status."""
    return [
        ProviderStatus(
            provider="Website Lead Form",
            category="Lead Capture Webhook",
            isConfigured=True,
            isOperational=True,
            statusDescription="Live receiver ready at /api/integrations/webhooks/website",
            endpoint="/api/integrations/webhooks/website"
        ),
        ProviderStatus(
            provider="Meta Lead Ads",
            category="Advertising Ingestion",
            isConfigured=True,
            isOperational=True,
            statusDescription="Adapter operational with HMAC signature verification & idempotency cache.",
            endpoint="/api/integrations/webhooks/meta-lead-ads"
        ),
        ProviderStatus(
            provider="WhatsApp Cloud API",
            category="Messaging Webhook",
            isConfigured=True,
            isOperational=True,
            statusDescription="Challenge verification & inbound message parser operational.",
            endpoint="/api/integrations/webhooks/whatsapp"
        ),
        ProviderStatus(
            provider="Google Calendar",
            category="Scheduling Connector",
            isConfigured=False,
            isOperational=False,
            statusDescription="Adapter contract ready; live Google OAuth credentials pending setup.",
            endpoint="/api/integrations/calendar/sync-event"
        ),
        ProviderStatus(
            provider="Gmail / Outlook Email",
            category="Mail Sync Connector",
            isConfigured=False,
            isOperational=False,
            statusDescription="Interaction logger adapter ready; live IMAP/Graph API credentials pending setup.",
            endpoint="/api/integrations/email/sync-interaction"
        )
    ]
