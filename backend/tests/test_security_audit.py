import pytest
import hmac
import hashlib
import json
from app.config import Settings, settings, DEFAULT_DEV_SECRET
from app.seed import seed_database, provision_admin
from app.models.lead import Lead


def test_anonymous_requests_are_rejected(client):
    """
    Priority 1 Audit: Verify all internal CRM routes reject unauthenticated requests with HTTP 401.
    """
    endpoints = [
        ("GET", "/api/leads"),
        ("POST", "/api/leads", {"companyName": "Insecure Corp", "contactName": "Hacker"}),
        ("GET", "/api/leads/LEAD-101"),
        ("PUT", "/api/leads/LEAD-101", {"companyName": "Insecure Corp", "contactName": "Hacker"}),
        ("PATCH", "/api/leads/LEAD-101", {"notes": "Unauthorized"}),
        ("DELETE", "/api/leads/LEAD-101"),
        ("PATCH", "/api/leads/LEAD-101/assignment", {"assignedEmployee": "Carlos Mendes"}),
        ("PATCH", "/api/leads/LEAD-101/stage", {"stage": "Contacted"}),
        ("GET", "/api/leads/LEAD-101/notes"),
        ("POST", "/api/leads/LEAD-101/notes", {"content": "Unauthorized Note"}),
        ("GET", "/api/leads/LEAD-101/activities"),
        ("POST", "/api/leads/LEAD-101/activities", {"type": "Call", "title": "Unauthorized Activity"}),
        ("POST", "/api/leads/duplicates/check", {"email": "test@example.com"}),
        ("GET", "/api/pipeline/stages"),
        ("POST", "/api/pipeline/stages", {"id": "Test", "label": "Test", "display_order": 9}),
        ("PATCH", "/api/pipeline/stages/New", {"label": "Updated New"}),
        ("DELETE", "/api/pipeline/stages/New"),
        ("GET", "/api/follow-ups"),
        ("POST", "/api/follow-ups", {"leadId": "LEAD-101", "action": "Call", "dueDate": "2026-10-20"}),
        ("PATCH", "/api/follow-ups/1", {"status": "Completed"}),
        ("DELETE", "/api/follow-ups/1"),
        ("GET", "/api/activities"),
        ("POST", "/api/activities", {"leadId": "LEAD-101", "type": "Call", "title": "Test"}),
        ("GET", "/api/dashboard/metrics"),
        ("GET", "/api/dashboard/pipeline"),
        ("GET", "/api/dashboard/employee-metrics"),
        ("GET", "/api/export/leads?format=csv"),
        ("POST", "/api/import/leads", {}),
        ("GET", "/api/users"),
        ("POST", "/api/users", {"email": "newuser@belvo.com", "fullName": "New User", "password": "Password123!"}),
        ("GET", "/api/users/1"),
        ("PATCH", "/api/users/1", {"fullName": "Hacked Name"}),
        ("PATCH", "/api/users/1/status", {"isActive": False}),
        ("GET", "/api/ai/daily-manager"),
        ("GET", "/api/ai/duplicates/analyze"),
        ("GET", "/api/ai/leads/LEAD-101/insights"),
        ("POST", "/api/ai/leads/LEAD-101/score"),
        ("POST", "/api/ai/leads/LEAD-101/summary"),
        ("POST", "/api/ai/leads/LEAD-101/draft-message", {"platform": "Email", "tone": "Professional"}),
        ("GET", "/api/integrations/status"),
        ("POST", "/api/integrations/calendar/sync-event", {"leadId": "LEAD-101", "title": "Test"}),
        ("POST", "/api/integrations/email/sync-interaction", {"leadId": "LEAD-101", "subject": "Test"}),
    ]

    for item in endpoints:
        method = item[0]
        url = item[1]
        payload = item[2] if len(item) > 2 else None

        if method == "GET":
            res = client.get(url)
        elif method == "POST":
            res = client.post(url, json=payload or {})
        elif method == "PUT":
            res = client.put(url, json=payload or {})
        elif method == "PATCH":
            res = client.patch(url, json=payload or {})
        elif method == "DELETE":
            res = client.delete(url)
        else:
            continue

        assert res.status_code == 401, f"Expected 401 Unauthorized for {method} {url}, got {res.status_code}"


def test_employee_cannot_access_unassigned_notes_or_ai(client, employee_token):
    """
    Priority 2 Audit: Verify that standard Employees cannot access notes, draft messages, or score
    leads assigned to other employees.
    """
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    # LEAD-102 is assigned to Carlos Mendes, while employee_token is Ashwini Sharma
    res_notes = client.get("/api/leads/LEAD-102/notes", headers=headers)
    assert res_notes.status_code == 403
    assert "access forbidden" in res_notes.json()["detail"].lower()

    res_post_note = client.post(
        "/api/leads/LEAD-102/notes",
        json={"content": "Spying note"},
        headers=headers
    )
    assert res_post_note.status_code == 403

    res_ai_insights = client.get("/api/ai/leads/LEAD-102/insights", headers=headers)
    assert res_ai_insights.status_code == 403

    res_ai_draft = client.post(
        "/api/ai/leads/LEAD-102/draft-message",
        json={"platform": "Email", "tone": "Professional"},
        headers=headers
    )
    assert res_ai_draft.status_code == 403


def test_employee_cannot_access_user_management(client, employee_token):
    """
    Priority 2 Audit: Verify that standard Employees cannot list, create, or toggle users.
    """
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    res_list = client.get("/api/users", headers=headers)
    assert res_list.status_code == 403

    res_create = client.post(
        "/api/users",
        json={"email": "hacker@belvo.com", "fullName": "Hacker", "password": "Password123!"},
        headers=headers
    )
    assert res_create.status_code == 403

    res_status = client.patch(
        "/api/users/1/status",
        json={"isActive": False},
        headers=headers
    )
    assert res_status.status_code == 403


def test_employee_cannot_reassign_lead(client, employee_token):
    """
    Priority 2 Audit: Verify that standard Employees cannot reassign leads (requires ADMIN).
    """
    headers = {"Authorization": f"Bearer {employee_token}"}
    payload = {"assignedEmployee": "Carlos Mendes"}
    res = client.patch("/api/leads/LEAD-101/assignment", json=payload, headers=headers)
    assert res.status_code == 403
    assert "administrative" in res.json()["detail"].lower()


def test_admin_can_reassign_lead_to_valid_user(client, admin_token):
    """
    Priority 2 Audit: Verify Admin can reassign a lead to a valid, active user.
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"assignedEmployee": "Carlos Mendes"}
    res = client.patch("/api/leads/LEAD-101/assignment", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["assignedEmployee"] == "Carlos Mendes"

    # Reset assignment back to Ashwini Sharma
    client.patch("/api/leads/LEAD-101/assignment", json={"assignedEmployee": "Ashwini Sharma"}, headers=headers)


def test_reassign_to_invalid_user_rejected(client, admin_token):
    """
    Priority 2 Audit: Verify reassignment target must correspond to an active user account.
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"assignedEmployee": "NonExistent Ghost Employee"}
    res = client.patch("/api/leads/LEAD-101/assignment", json=payload, headers=headers)
    assert res.status_code == 400
    assert "active user account" in res.json()["detail"].lower()


def test_employee_cannot_modify_pipeline_stages(client, employee_token):
    """
    Priority 1 & 2 Audit: Verify Pipeline Stage modifications require ADMIN role.
    """
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    # Attempt to create a stage
    res_create = client.post("/api/pipeline/stages", json={"id": "AuditStage", "label": "Audit Stage", "display_order": 99}, headers=headers)
    assert res_create.status_code == 403

    # Attempt to update a stage
    res_update = client.patch("/api/pipeline/stages/New", json={"label": "Hacked Stage"}, headers=headers)
    assert res_update.status_code == 403

    # Attempt to delete a stage
    res_delete = client.delete("/api/pipeline/stages/New", headers=headers)
    assert res_delete.status_code == 403


def test_production_configuration_rejects_unsafe_secrets():
    """
    Priority 3 Audit: Verify Settings validator rejects default or short JWT secrets in production.
    """
    # Test 1: Production with default secret should fail
    with pytest.raises(ValueError, match="Unsafe or default JWT_SECRET detected"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=DEFAULT_DEV_SECRET
        )

    # Test 2: Production with short secret (< 32 chars) should fail
    with pytest.raises(ValueError, match="at least 32 characters"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short-prod-secret"
        )

    # Test 3: Production with strong 32+ character random secret should succeed
    valid_settings = Settings(
        ENVIRONMENT="production",
        SECRET_KEY="a" * 32
    )
    assert valid_settings.ENVIRONMENT == "production"
    assert valid_settings.SECRET_KEY == "a" * 32


def test_seed_database_refuses_in_production(db_session, monkeypatch):
    """
    Priority 3 Audit: Verify seed_database refuses to seed synthetic demo leads in production,
    and verify that dedicated admin provisioning works.
    """
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")

    initial_count = db_session.query(Lead).count()
    seed_database(db_session)
    final_count = db_session.query(Lead).count()

    # In production, automatic synthetic demo leads must NOT be seeded
    assert final_count == initial_count

    # Dedicated CLI admin provisioning must still work safely in production
    admin_user = provision_admin(
        db_session,
        email="prod.admin@belvo.com",
        password="ProductionSecurePassword123!",
        full_name="Production Admin"
    )
    assert admin_user.email == "prod.admin@belvo.com"
    assert admin_user.role == "ADMIN"
    assert admin_user.is_active is True


def test_meta_webhook_security_and_deduplication(client):
    """
    Priority 4 Audit: Verify Meta webhook signature validation and persistent event deduplication.
    """
    secret = settings.META_APP_SECRET or "belvo_meta_app_secret_test"
    payload = {
        "object": "page",
        "entry": [
            {
                "id": "1001",
                "time": 1728556800,
                "changes": [
                    {
                        "field": "leadgen",
                        "value": {
                            "leadgen_id": "META_SEC_TEST_001",
                            "page_id": "PAGE_1001",
                            "form_id": "FORM_1001",
                            "created_time": 1728556800
                        }
                    }
                ]
            }
        ]
    }
    raw_bytes = json.dumps(payload).encode("utf-8")

    # 1. Missing signature -> 401
    res_no_sig = client.post("/api/integrations/webhooks/meta-lead-ads", content=raw_bytes)
    assert res_no_sig.status_code == 401
    assert "missing" in res_no_sig.json()["detail"].lower()

    # 2. Invalid signature -> 401
    res_bad_sig = client.post(
        "/api/integrations/webhooks/meta-lead-ads",
        content=raw_bytes,
        headers={"x-hub-signature-256": "sha256=invalidhashvalue000000000000000000000000"}
    )
    assert res_bad_sig.status_code == 401
    assert "signature" in res_bad_sig.json()["detail"].lower()

    # 3. Valid signature -> 200
    valid_sig = "sha256=" + hmac.new(secret.encode("utf-8"), raw_bytes, hashlib.sha256).hexdigest()
    res_valid = client.post(
        "/api/integrations/webhooks/meta-lead-ads",
        content=raw_bytes,
        headers={"x-hub-signature-256": valid_sig, "Content-Type": "application/json"}
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["leadgenId"] == "META_SEC_TEST_001"

    # 4. Duplicate replay with identical leadgen_id -> returns processed True without duplicating
    res_dup = client.post(
        "/api/integrations/webhooks/meta-lead-ads",
        content=raw_bytes,
        headers={"x-hub-signature-256": valid_sig, "Content-Type": "application/json"}
    )
    assert res_dup.status_code == 200
    assert res_dup.json()["isDuplicate"] is True
    assert res_dup.json()["action"] == "ignored_duplicate_webhook"
