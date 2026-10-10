from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from app.schemas.integrations import (
    WebsiteLeadWebhookPayload,
    MetaLeadWebhookPayload,
    WhatsAppWebhookPayload,
    CalendarSyncEventRequest,
    CalendarSyncEventResponse,
    EmailSyncInteractionRequest,
    EmailSyncInteractionResponse,
    IntegrationStatusResponse
)
from app.services.integrations_service import (
    process_website_lead_form,
    process_meta_lead_ad,
    process_whatsapp_inbound_message,
    sync_google_calendar_event,
    sync_email_interaction,
    get_integration_status_list,
    verify_hmac_sha256
)

router = APIRouter(prefix="/integrations", tags=["Integration Architecture"])


@router.get("/status", response_model=IntegrationStatusResponse)
def get_status():
    """Diagnostic endpoint checking external provider integration readiness."""
    return IntegrationStatusResponse(providers=get_integration_status_list())


@router.post("/webhooks/website")
def webhook_website_lead(
    payload: WebsiteLeadWebhookPayload,
    db: Session = Depends(get_db)
):
    """Ingest website lead capture form submissions."""
    result = process_website_lead_form(db, payload)
    return result


@router.get("/webhooks/whatsapp")
def verify_whatsapp_challenge(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """Verify Meta / WhatsApp Cloud API webhook challenge."""
    expected_token = "belvo-crm-wa-verify-token-2026"
    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        return int(hub_challenge) if (hub_challenge and hub_challenge.isdigit()) else hub_challenge
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@router.post("/webhooks/whatsapp")
def webhook_whatsapp_message(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Receive incoming WhatsApp message and link to lead timeline."""
    sender = "Unknown"
    text = "Inbound message"

    # Support standard and simplified testing payloads
    if "messages" in payload and payload["messages"]:
        msg = payload["messages"][0]
        sender = msg.get("from") or msg.get("from_number") or sender
        text = msg.get("text", {}).get("body") if isinstance(msg.get("text"), dict) else str(msg.get("text") or text)
    elif "sender" in payload:
        sender = payload.get("sender")
        text = payload.get("body", "Hello Belvo")

    result = process_whatsapp_inbound_message(db, sender=str(sender), text=str(text))
    return result


@router.post("/webhooks/meta-lead-ads")
async def webhook_meta_lead_ads(
    request: Request,
    db: Session = Depends(get_db),
    x_hub_signature_256: Optional[str] = Header(None)
):
    """Receive Meta Lead Ads event with signature validation & idempotency."""
    body_bytes = await request.body()

    # If secret header configured, verify HMAC signature
    meta_app_secret = "belvo_meta_app_secret_test"
    if x_hub_signature_256:
        is_valid = verify_hmac_sha256(body_bytes, x_hub_signature_256, meta_app_secret)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid Meta HMAC signature")

    payload = await request.json()
    leadgen_id = f"meta_{int(request.client.port if request.client else 8000)}_{len(body_bytes)}"
    form_data = {}

    if "entry" in payload and payload["entry"]:
        entry = payload["entry"][0]
        leadgen_id = entry.get("id", leadgen_id)
        if "changes" in entry and entry["changes"]:
            val = entry["changes"][0].get("value", {})
            leadgen_id = val.get("leadgen_id", leadgen_id)
            form_data = val.get("field_data", {})
    elif "leadgen_id" in payload:
        leadgen_id = payload["leadgen_id"]
        form_data = payload.get("form_data", {})

    result = process_meta_lead_ad(db, leadgen_id=str(leadgen_id), form_data=form_data)
    return result


@router.post("/calendar/sync-event", response_model=CalendarSyncEventResponse)
def sync_calendar(
    req: CalendarSyncEventRequest,
    db: Session = Depends(get_db)
):
    """Sync scheduled meeting with Google Calendar adapter."""
    return sync_google_calendar_event(db, req)


@router.post("/email/sync-interaction", response_model=EmailSyncInteractionResponse)
def sync_email(
    req: EmailSyncInteractionRequest,
    db: Session = Depends(get_db)
):
    """Sync email interaction with Outlook/Gmail connector adapter."""
    return sync_email_interaction(db, req)
