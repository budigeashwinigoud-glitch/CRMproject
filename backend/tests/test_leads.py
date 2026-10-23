def test_list_leads_returns_seeded_data(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/leads", headers=headers)
    assert res.status_code == 200
    leads = res.json()
    assert len(leads) >= 10
    first_lead = leads[0]
    assert "id" in first_lead
    assert "fullName" in first_lead
    assert "company" in first_lead
    assert "pipelineStage" in first_lead


def test_create_lead_full_lifecycle(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "fullName": "Rodrigo Silva",
        "company": "Banco Inter Brasil",
        "email": "rodrigo.silva@bancointer.com.br",
        "phone": "+55 31 98877-6655",
        "leadSource": "Referral",
        "leadCategory": "Digital Banking",
        "priority": "High",
        "pipelineStage": "Qualified",
        "assignedEmployee": "Pavan Kumar",
        "expectedValue": 95000,
        "notes": "Looking to integrate automated income verification.",
        "nextFollowUpDate": "2026-10-28",
        "website": "https://bancointer.com.br",
        "location": "Belo Horizonte, Brazil"
    }
    res = client.post("/api/leads", json=payload, headers=headers)
    assert res.status_code == 201
    created = res.json()
    lead_id = created["id"]
    assert lead_id.startswith("LEAD-")
    assert created["company"] == "Banco Inter Brasil"
    assert created["expectedValue"] == 95000

    # Verify lead can be fetched directly
    get_res = client.get(f"/api/leads/{lead_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["email"] == "rodrigo.silva@bancointer.com.br"

    # Verify stage transition
    patch_stage_res = client.patch(f"/api/leads/{lead_id}/stage", json={"stage": "Proposal"}, headers=headers)
    assert patch_stage_res.status_code == 200
    assert patch_stage_res.json()["pipelineStage"] == "Proposal"

    # Verify assignment change
    patch_assign_res = client.patch(
        f"/api/leads/{lead_id}/assignment",
        json={"assignedEmployee": "Carlos Mendes"},
        headers=headers
    )
    assert patch_assign_res.status_code == 200
    assert patch_assign_res.json()["assignedEmployee"] == "Carlos Mendes"

    # Verify activity was automatically logged
    act_res = client.get(f"/api/leads/{lead_id}/activities", headers=headers)
    assert act_res.status_code == 200
    acts = act_res.json()
    assert len(acts) >= 2  # creation, stage transition, reassignment

    # Verify archive and restore
    arch_res = client.post(f"/api/leads/{lead_id}/archive", headers=headers)
    assert arch_res.status_code == 200
    assert arch_res.json()["isArchived"] is True

    # Leads list should exclude archived by default
    active_res = client.get("/api/leads", headers=headers)
    active_ids = [l["id"] for l in active_res.json()]
    assert lead_id not in active_ids

    # Restore lead
    rest_res = client.post(f"/api/leads/{lead_id}/restore", headers=headers)
    assert rest_res.status_code == 200
    assert rest_res.json()["isArchived"] is False


def test_lead_search_and_filters(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Search by company
    res = client.get("/api/leads?search=Nubank", headers=headers)
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert any("Nubank" in l["company"] for l in results)

    # Filter by stage
    res_stage = client.get("/api/leads?stage=Won", headers=headers)
    assert res_stage.status_code == 200
    won_leads = res_stage.json()
    assert all(l["pipelineStage"] == "Won" for l in won_leads)

    # Filter by priority
    res_pri = client.get("/api/leads?priority=High", headers=headers)
    assert res_pri.status_code == 200
    high_leads = res_pri.json()
    assert all(l["priority"] == "High" for l in high_leads)
