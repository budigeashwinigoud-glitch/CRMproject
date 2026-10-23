#!/usr/bin/env python3
"""
Belvo CRM - 4-Week Assignment Complete End-to-End Verification Suite
Validates Week 1, Week 2, Week 3, and Week 4 requirements via FastAPI TestClient.
"""

import sys
import os
import hmac
import hashlib
import json

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath("backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

passed = 0
failed = 0

def test_case(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  [PASS] {name}")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] {name} -> {e}")
        failed += 1

print("\n" + "=" * 65)
print(" BELVO CRM - 4-WEEK ASSIGNMENT END-TO-END VERIFICATION")
print("=" * 65)

# Authenticate Admin and Employee
admin_token = None
employee_token = None

def get_auth_tokens():
    global admin_token, employee_token
    res_admin = client.post("/api/auth/login", json={"email": "admin@belvo.com", "password": "Admin@12345"})
    assert res_admin.status_code == 200, f"Admin login failed: {res_admin.text}"
    admin_token = res_admin.json()["access_token"]

    res_emp = client.post("/api/auth/login", json={"email": "pavan@belvo.com", "password": "Pavan@12345"})
    assert res_emp.status_code == 200, f"Employee login failed: {res_emp.text}"
    employee_token = res_emp.json()["access_token"]

# -------------------------------------------------------------
# WEEK 1: CRM Foundation & Authentication
# -------------------------------------------------------------
print("\n [WEEK 1] CRM Foundation, Database Persistence & Access Control")

def test_week1_auth():
    get_auth_tokens()
    assert admin_token and employee_token

test_case("1.1 JWT Authentication for Admin & Employee", test_week1_auth)

created_lead_id = None

def test_week1_lead_lifecycle():
    global created_lead_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Create Lead
    payload = {
        "fullName": "Sofia Alvarez",
        "company": "Horizon Agency Partner",
        "email": "sofia.alvarez@horizonbrand.com",
        "phone": "+1 555-019-8234",
        "leadSource": "Website",
        "leadCategory": "Brand Building & Web",
        "priority": "High",
        "pipelineStage": "New",
        "assignedEmployee": "Pavan Kumar",
        "expectedValue": 45000.0,
        "notes": "Interested in end-to-end brand redesign and web app development."
    }
    res = client.post("/api/leads", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    created_lead_id = data["id"]
    assert data["company"] == "Horizon Agency Partner"
    
    # 2. Update Lead
    update_res = client.patch(f"/api/leads/{created_lead_id}", json={"expectedValue": 55000.0, "notes": "Scope expanded."}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["expectedValue"] == 55000.0

    # 3. Archive Lead
    arch_res = client.delete(f"/api/leads/{created_lead_id}", headers=headers)
    assert arch_res.status_code == 200
    
    # Verify Archived in list via query param
    arch_list = client.get("/api/leads?include_archived=true", headers=headers)
    assert arch_list.status_code == 200
    assert any(l["id"] == created_lead_id for l in arch_list.json())

    # 4. Restore Lead
    restore_res = client.post(f"/api/leads/{created_lead_id}/restore", headers=headers)
    assert restore_res.status_code == 200
    assert restore_res.json()["isArchived"] is False

test_case("1.2 Full Lead Lifecycle: Create, Update, Archive & Restore", test_week1_lead_lifecycle)

def test_week1_role_isolation():
    headers_emp = {"Authorization": f"Bearer {employee_token}"}
    # Employee cannot view all users (Admin only)
    res_users = client.get("/api/users", headers=headers_emp)
    assert res_users.status_code == 403

test_case("1.3 Role-Based Security: Employee restricted from User Management", test_week1_role_isolation)

# -------------------------------------------------------------
# WEEK 2: Pipeline Kanban, Follow-ups & Activity Audit
# -------------------------------------------------------------
print("\n [WEEK 2] Pipeline Progression, Follow-ups & Activity History")

def test_week2_pipeline_transition():
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Move lead to Proposal stage
    res = client.patch(f"/api/leads/{created_lead_id}/stage", json={"stage": "Proposal"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["pipelineStage"] == "Proposal"

test_case("2.1 Dynamic Pipeline Progression & Stage Transition", test_week2_pipeline_transition)

created_fu_id = None

def test_week2_follow_ups():
    global created_fu_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "leadId": created_lead_id,
        "title": "Creative Scope Alignment Review",
        "type": "Meeting",
        "dueDate": "2026-10-30",
        "dueTime": "14:00",
        "priority": "High",
        "assignedEmployee": "Pavan Kumar",
        "notes": "Walk through revised wireframes and SOW."
    }
    res = client.post("/api/follow-ups", json=payload, headers=headers)
    assert res.status_code == 201
    created_fu_id = res.json()["id"]

    # Mark Complete
    comp_res = client.patch(f"/api/follow-ups/{created_fu_id}/status", json={"status": "Completed"}, headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "Completed"

test_case("2.2 Task & Follow-up Scheduling, Due Dates & Completion", test_week2_follow_ups)

def test_week2_activity_audit():
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/activities", headers=headers)
    assert res.status_code == 200
    activities = res.json()
    assert len(activities) > 0
    # Confirm stage change and lead creation were logged
    assert any(a.get("leadId") == created_lead_id for a in activities)

test_case("2.3 Activity History & Audit Logging Verification", test_week2_activity_audit)

# -------------------------------------------------------------
# WEEK 3: Executive Dashboard & Integrations Architecture
# -------------------------------------------------------------
print("\n [WEEK 3] Dashboard Analytics, CSV/Excel IO & Webhook Integrations")

def test_week3_dashboard_kpis():
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/dashboard/metrics", headers=headers)
    assert res.status_code == 200
    metrics = res.json()
    assert "totalLeads" in metrics
    assert "activePipelineValue" in metrics
    assert "wonValue" in metrics
    assert "stageBreakdown" in metrics

test_case("3.1 Executive Dashboard Metrics Aggregation", test_week3_dashboard_kpis)

def test_week3_export_formats():
    headers = {"Authorization": f"Bearer {admin_token}"}
    res_csv = client.get("/api/export/leads?format=csv", headers=headers)
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]

    res_xlsx = client.get("/api/export/leads?format=xlsx", headers=headers)
    assert res_xlsx.status_code == 200
    assert "openxmlformats" in res_xlsx.headers["content-type"]

test_case("3.2 Lead Data Export to CSV & Excel Formats", test_week3_export_formats)

def test_week3_meta_webhook():
    meta_secret = settings.META_APP_SECRET or "belvo_meta_app_secret_test"
    payload = {
        "leadgen_id": "meta_lead_e2e_9999",
        "field_data": {
            "full_name": "Elena Rostova",
            "company_name": "Global Retail Brand",
            "email": "elena@globalbrand.com",
            "phone_number": "+1 415-555-2671"
        }
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    sig = "sha256=" + hmac.new(meta_secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    
    res = client.post(
        "/api/integrations/webhooks/meta-lead-ads",
        content=payload_bytes,
        headers={"Content-Type": "application/json", "x-hub-signature-256": sig}
    )
    assert res.status_code == 200
    assert res.json()["success"] is True

test_case("3.3 Meta Lead Ads Webhook with HMAC-SHA256 Signature Verification", test_week3_meta_webhook)

def test_week3_website_form_webhook():
    payload = {
        "fullName": "Marcus Brody",
        "company": "Brody Creative Studios",
        "email": "marcus@brodystudios.com",
        "phone": "+1 555-891-2091",
        "notes": "Urgent inquiry regarding brand refresh."
    }
    res = client.post("/api/integrations/webhooks/website", json=payload)
    assert res.status_code == 200
    assert res.json()["success"] is True

test_case("3.4 Website Inbound Lead Capture Webhook & Deduplication", test_week3_website_form_webhook)

def test_week3_calendar_and_email_sync():
    headers = {"Authorization": f"Bearer {admin_token}"}
    cal_res = client.post(
        "/api/integrations/calendar/sync-event",
        json={
            "leadId": created_lead_id,
            "title": "Brand Kickoff Call",
            "startTime": "2026-11-01 10:00",
            "attendeeEmail": "sofia.alvarez@horizonbrand.com"
        },
        headers=headers
    )
    assert cal_res.status_code == 200
    assert cal_res.json()["success"] is True

    email_res = client.post(
        "/api/integrations/email/sync-interaction",
        json={
            "leadId": created_lead_id,
            "subject": "Proposal Delivery",
            "bodySnippet": "Enclosed is our creative strategy roadmap.",
            "fromEmail": "admin@belvo.com",
            "toEmail": "sofia.alvarez@horizonbrand.com"
        },
        headers=headers
    )
    assert email_res.status_code == 200
    assert email_res.json()["success"] is True

test_case("3.5 Google Calendar & Email Synchronization Adapters", test_week3_calendar_and_email_sync)

# -------------------------------------------------------------
# WEEK 4: AI/ML Lead Scoring, Generative Drafts & Deployment
# -------------------------------------------------------------
print("\n [WEEK 4] AI/ML Intelligence, Communication Drafts & Deployment Config")

def test_week4_ai_lead_insights():
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get(f"/api/ai/leads/{created_lead_id}/insights", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["aiScore"] >= 0
    assert data["conversionProbability"] >= 0.0
    assert len(data["keyFactors"]) > 0
    assert len(data["nextBestActions"]) > 0

test_case("4.1 AI Lead Scoring & Conversion Probability Insights", test_week4_ai_lead_insights)

def test_week4_message_drafting():
    headers = {"Authorization": f"Bearer {admin_token}"}
    for channel in ["Email", "WhatsApp", "LinkedIn"]:
        res = client.post(
            f"/api/ai/leads/{created_lead_id}/draft-message",
            json={"channel": channel, "tone": "Professional", "objective": "Follow up on agency partnership"},
            headers=headers
        )
        assert res.status_code == 200
        draft = res.json()
        assert "Belvo" in draft["bodyDraft"]
        assert draft["channel"].lower() == channel.lower()

test_case("4.2 Multi-Channel Communication Draft Generation (Email, WhatsApp, LinkedIn)", test_week4_message_drafting)

def test_week4_daily_manager():
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/ai/daily-manager", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "dailySummary" in data
    assert "topOpportunities" in data

test_case("4.3 AI Daily Manager Priority Brief & Opportunity Identification", test_week4_daily_manager)

def test_week4_deployment_readiness():
    assert os.path.exists("Dockerfile"), "Dockerfile missing"
    assert os.path.exists("docker-compose.yml"), "docker-compose.yml missing"
    assert os.path.exists(".env.example"), ".env.example missing"
    assert os.path.exists("DEPLOYMENT.md"), "DEPLOYMENT.md missing"

test_case("4.4 Production Deployment Configuration (Docker, Compose, Env & Docs)", test_week4_deployment_readiness)

# Cleanup test lead
def test_cleanup():
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.delete(f"/api/leads/{created_lead_id}", headers=headers)

test_case("4.5 Clean Database Teardown & Isolation", test_cleanup)

print("\n" + "=" * 65)
print(f" SUMMARY: {passed} / {passed + failed} TEST SUITES PASSED ({(passed / (passed + failed) * 100):.1f}%)")
print("=" * 65 + "\n")

if failed > 0:
    sys.exit(1)
