def test_login_success(client):
    res = client.post("/api/auth/login", json={"email": "admin@belvo.com", "password": "Admin@12345"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "admin@belvo.com"


def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={"email": "admin@belvo.com", "password": "WrongPassword"})
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_login_nonexistent_user(client):
    res = client.post("/api/auth/login", json={"email": "nobody@belvo.com", "password": "Password123"})
    assert res.status_code == 401


def test_get_me_authenticated(client, admin_token):
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@belvo.com"
    assert data["role"] == "ADMIN"


def test_get_me_unauthenticated(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_admin_can_access_users_list(client, admin_token):
    res = client.get("/api/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 5


def test_employee_cannot_access_users_list(client, employee_token):
    res = client.get("/api/users", headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]


def test_admin_can_create_new_employee(client, admin_token):
    payload = {
        "fullName": "Sofia Tech",
        "email": "sofia.tech@belvo.com",
        "password": "Password@123",
        "role": "EMPLOYEE",
        "isActive": True
    }
    res = client.post("/api/users", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "sofia.tech@belvo.com"
    assert data["role"] == "EMPLOYEE"
