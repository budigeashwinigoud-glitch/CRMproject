import pytest
import hmac
import hashlib
import json


def test_provider_status(client, admin_token):
    res = client.get("/api/integrations/status", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "providers" in data
    assert any(p["provider"] == "WhatsApp Cloud API" for p in data["providers"])
    assert any(p["provider"] == "Meta Lead Ads" for p in data["providers"])


def test_website_webhook_ingestion(client):
    payload = {
        "fullName": "Carlos Mendoza",
        "email": "carlos.mendoza@latamfin.co",
        "phone": "+52 55 9876 5432",
        "company": "LatAm Fin Co",
        "notes": "Interested in Belvo account aggregation and transactions API",
        "assignedEmployee": "Ashwini Sharma"
    }
    res = client.post("/api/integrations/webhooks/website", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "leadId" in data
    assert data["action"] == "created_new_lead"


def test_whatsapp_webhook_verification(client):
    # Challenge verification
    res = client.get(
        "/api/integrations/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "belvo-crm-wa-verify-token-2026",
            "hub.challenge": "challenge_token_abc123"
        }
    )
    assert res.status_code == 200
    assert "challenge_token_abc123" in res.text


def test_whatsapp_inbound_message(client):
    payload = {
        "sender": "+52 55 1234 5678",
        "body": "Hello, we want to know pricing for Belvo Fiscal API"
    }
    res = client.post("/api/integrations/webhooks/whatsapp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "leadId" in data


def test_meta_lead_ads_webhook_with_signature(client):
    payload = {
        "object": "page",
        "entry": [
            {
                "id": "PAGE_1",
                "time": 1728556800,
                "changes": [
                    {
                        "field": "leadgen",
                        "value": {
                            "leadgen_id": "META_LEAD_998877",
                            "field_data": {
                                "full_name": "Rodrigo Silva",
                                "email": "rodrigo@nubank-partner.br",
                                "company_name": "NuPartner Brasil",
                                "phone_number": "+55 11 91234 5678"
                            }
                        }
                    }
                ]
            }
        ]
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    app_secret = "belvo_meta_app_secret_test".encode("utf-8")
    sig = "sha256=" + hmac.new(app_secret, payload_bytes, hashlib.sha256).hexdigest()

    # Call with signature
    res = client.post(
        "/api/integrations/webhooks/meta-lead-ads",
        content=payload_bytes,
        headers={"x-hub-signature-256": sig, "Content-Type": "application/json"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["leadgenId"] == "META_LEAD_998877"


def test_calendar_and_email_sync(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    # 1. Calendar event sync
    cal_payload = {
        "leadId": "LEAD-101",
        "title": "Belvo Tech Architecture Review",
        "startTime": "2026-10-15 14:00",
        "durationMinutes": 60,
        "attendeeEmail": "tech@creditas.com",
        "assignedEmployee": "Ashwini Sharma"
    }
    res_cal = client.post("/api/integrations/calendar/sync-event", json=cal_payload, headers=headers)
    assert res_cal.status_code == 200
    assert res_cal.json()["success"] is True
    assert res_cal.json()["status"] == "CONFIRMED_LOCAL"

    # 2. Email interaction sync
    mail_payload = {
        "leadId": "LEAD-101",
        "subject": "Proposal Sent: Belvo API Contract 2026",
        "fromEmail": "ashwini@belvo.com",
        "toEmail": "commercial@creditas.com",
        "bodySnippet": "Attached please find the commercial terms and SLA details."
    }
    res_mail = client.post("/api/integrations/email/sync-interaction", json=mail_payload, headers=headers)
    assert res_mail.status_code == 200
    assert res_mail.json()["success"] is True
