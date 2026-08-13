import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed import seed_db


client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    seed_db()
    yield

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_login_success():
    response = client.post(
        "/api/auth/login-json",
        json={"email": "admin@insure.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

def test_login_invalid_password():
    response = client.post(
        "/api/auth/login-json",
        json={"email": "admin@insure.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_policy_catalog():
    response = client.get("/api/policy-catalog")
    assert response.status_code == 200
    catalog = response.json()
    assert len(catalog) >= 4
    assert catalog[0]["code"] == "POL-HLTH-01"

def test_customer_claim_workflow():
    # 1. Login as customer
    login_resp = client.post(
        "/api/auth/login-json",
        json={"email": "customer@insure.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get customer policies
    policies_resp = client.get("/api/policies", headers=headers)
    assert policies_resp.status_code == 200
    policies = policies_resp.json()
    assert len(policies) > 0
    policy_id = policies[0]["id"]

    # 3. Submit a new claim
    claim_payload = {
        "policy_id": policy_id,
        "reason": "Test Medical Outpatient Claim",
        "description": "Routine test claim submission for unit verification",
        "amount": 15000.0,
        "incident_date": "2026-08-01T10:00:00"
    }
    claim_resp = client.post("/api/claims", json=claim_payload, headers=headers)
    assert claim_resp.status_code == 201
    claim_data = claim_resp.json()
    assert claim_data["status"] == "SUBMITTED"
    assert claim_data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
