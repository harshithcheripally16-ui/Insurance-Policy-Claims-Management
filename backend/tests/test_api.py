import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["agent"] == "Priya Nair (Verified Insurance Agent)"

def test_login_agent_success():
    response = client.post("/api/auth/login", json={
        "email": "agent@insure.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "agent@insure.com"
    assert data["user"]["role"] == "AGENT"

def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "email": "agent@insure.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_policy_catalog():
    response = client.get("/api/policies/catalog")
    assert response.status_code == 200
    catalog = response.json()
    assert isinstance(catalog, list)
    assert len(catalog) > 0

def test_get_customers_reindexed():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": "agent@insure.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/users/customers", headers=headers)
    assert response.status_code == 200
    customers = response.json()
    assert isinstance(customers, list)
    assert len(customers) > 0
    # Check gapless sequential display_id reindexing
    for idx, cust in enumerate(customers, start=1):
        assert cust["display_id"] == idx

def test_get_policies_filter():
    login_res = client.post("/api/auth/login", json={
        "email": "agent@insure.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/policies?category=Health", headers=headers)
    assert response.status_code == 200
    policies = response.json()
    assert isinstance(policies, list)
    for p in policies:
        assert p["category"] == "Health"
