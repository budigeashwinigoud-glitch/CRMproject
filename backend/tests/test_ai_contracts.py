import pytest


def test_ai_lead_insights_contract(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    res = client.get("/api/ai/leads/LEAD-101/insights", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["leadId"] == "LEAD-101"
    assert "aiScore" in data
    assert "conversionProbability" in data
    assert "aiSummary" in data
    assert isinstance(data["keyFactors"], list)
    assert isinstance(data["nextBestActions"], list)


def test_ai_score_update_contract(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    payload = {
        "aiScore": 88,
        "conversionProbability": 0.88,
        "keyFactors": ["High transaction volume", "Completed technical discovery"],
        "modelVersion": "belvo-ml-v2.0"
    }
    res = client.post("/api/ai/leads/LEAD-101/score", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["aiScore"] == 88
    assert data["conversionProbability"] == 0.88


def test_ai_summary_update_contract(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    payload = {
        "summary": "Key decision-makers engaged. Budget approved for Q4 integration pilot.",
        "sentiment": "Positive",
        "buyingIntent": "High",
        "modelVersion": "belvo-nlp-v1.4"
    }
    res = client.post("/api/ai/leads/LEAD-101/summary", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["aiSummary"] == payload["summary"]


def test_ai_message_draft_contract(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    payload = {
        "channel": "Email",
        "tone": "Professional",
        "objective": "Follow up on API contract proposal"
    }
    res = client.post("/api/ai/leads/LEAD-101/draft-message", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["leadId"] == "LEAD-101"
    assert data["channel"] == "Email"
    assert "Belvo" in data["bodyDraft"]
    assert data["isHeuristicTemplate"] is True


def test_ai_daily_manager_contract(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    res = client.get("/api/ai/daily-manager", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "date" in data
    assert "salesSpecialist" in data
    assert "dailySummary" in data
    assert isinstance(data["overdueAlerts"], list)
    assert isinstance(data["topOpportunities"], list)


def test_ai_duplicates_analyze_contract(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    res = client.get(
        "/api/ai/duplicates/analyze",
        params={"email": "rodrigo.sanchez@nubank.com", "company": "Nubank Brasil"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["hasPotentialDuplicate"] is True
    assert len(data["candidates"]) >= 1
    assert data["candidates"][0]["existingLeadId"] == "LEAD-101"
