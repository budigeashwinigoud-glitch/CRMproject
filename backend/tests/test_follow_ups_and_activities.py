def test_follow_ups_crud_and_completion(client):
    res_list = client.get("/api/follow-ups")
    assert res_list.status_code == 200
    fus = res_list.json()
    assert len(fus) >= 7

    # Create new follow-up
    new_fu_payload = {
        "leadId": "LEAD-101",
        "title": "Follow up on contract compliance",
        "type": "Meeting",
        "dueDate": "2026-10-30",
        "dueTime": "14:00",
        "priority": "High",
        "assignedEmployee": "Ashwini Sharma",
        "notes": "Bring legal counsel"
    }
    create_res = client.post("/api/follow-ups", json=new_fu_payload)
    assert create_res.status_code == 201
    created_fu = create_res.json()
    fu_id = created_fu["id"]
    assert fu_id.startswith("FU-")
    assert created_fu["status"] == "Pending"

    # Mark completed
    comp_res = client.post(f"/api/follow-ups/{fu_id}/complete")
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "Completed"


def test_notes_creation_and_retrieval(client):
    note_payload = {
        "content": "Discussed volume-based tier discounts with CFO.",
        "authorName": "Carlos Mendes"
    }
    create_res = client.post("/api/leads/LEAD-102/notes", json=note_payload)
    assert create_res.status_code == 201
    note_data = create_res.json()
    assert note_data["leadId"] == "LEAD-102"
    assert note_data["content"] == "Discussed volume-based tier discounts with CFO."

    get_notes_res = client.get("/api/leads/LEAD-102/notes")
    assert get_notes_res.status_code == 200
    notes = get_notes_res.json()
    assert len(notes) >= 1
    assert any("Discussed volume-based" in n["content"] for n in notes)


def test_activities_logging_and_filtering(client):
    act_payload = {
        "leadId": "LEAD-103",
        "type": "email",
        "description": "Sent updated technical integration manual.",
        "performedBy": "Ashwini Sharma"
    }
    post_res = client.post("/api/activities", json=act_payload)
    assert post_res.status_code == 201
    act_data = post_res.json()
    assert act_data["type"] == "email"

    filter_res = client.get("/api/activities?leadId=LEAD-103")
    assert filter_res.status_code == 200
    acts = filter_res.json()
    assert len(acts) >= 1
