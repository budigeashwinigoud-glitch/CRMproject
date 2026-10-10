import pytest


def test_employee_cannot_access_unassigned_lead(client, employee_token):
    # Ashwini is assigned LEAD-101. LEAD-104 is assigned to Thrija Gowda.
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    # Attempt to read LEAD-104
    res = client.get("/api/leads/LEAD-104", headers=headers)
    assert res.status_code == 403
    assert "forbidden" in res.json()["detail"].lower()

    # Attempt to update LEAD-104
    res_update = client.patch("/api/leads/LEAD-104", json={"notes": "Tampered note"}, headers=headers)
    assert res_update.status_code == 403

    # Attempt to archive LEAD-104
    res_archive = client.delete("/api/leads/LEAD-104", headers=headers)
    assert res_archive.status_code == 403


def test_admin_can_access_any_lead(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Admin can view LEAD-104 assigned to Carlos
    res = client.get("/api/leads/LEAD-104", headers=headers)
    assert res.status_code == 200
    assert res.json()["id"] == "LEAD-104"


def test_employee_query_parameter_isolation(client, employee_token):
    # Ashwini requests employee metrics attempting to peek into Carlos's metrics
    headers = {"Authorization": f"Bearer {employee_token}"}
    res = client.get("/api/dashboard/employee-metrics?employee=Carlos Mendes", headers=headers)
    assert res.status_code == 200
    data = res.json()
    # The backend must override the target employee parameter with Ashwini Sharma
    assert data["employee"] == "Ashwini Sharma"


def test_employee_export_isolation(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    # Attempting to export Thrija's leads
    res = client.get("/api/export/leads?format=csv&employee=Thrija Gowda", headers=headers)
    assert res.status_code == 200
    content = res.text
    # Ashwini's lead LEAD-101 should be present, but Thrija's LEAD-104 should not be in the output
    assert "LEAD-101" in content
    assert "LEAD-104" not in content
