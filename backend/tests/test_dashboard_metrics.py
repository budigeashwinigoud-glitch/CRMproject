def test_dashboard_metrics_calculations(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/dashboard/metrics", headers=headers)
    assert res.status_code == 200
    metrics = res.json()

    assert "totalLeads" in metrics
    assert metrics["totalLeads"] >= 10
    assert metrics["wonLeads"] >= 1
    assert metrics["lostLeads"] >= 1
    assert metrics["wonValue"] >= 120000
    assert metrics["conversionRate"] > 0
    assert len(metrics["stageBreakdown"]) == 8
    assert len(metrics["sourceBreakdown"]) >= 5
    assert "High" in metrics["priorityCounts"]


def test_employee_metrics_calculations(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/dashboard/employee-metrics?employee=Carlos Mendes", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["employee"] == "Carlos Mendes"
    assert data["totalAssignedLeads"] >= 1
    assert data["wonValue"] >= 120000
    assert len(data["stageBreakdown"]) == 8
