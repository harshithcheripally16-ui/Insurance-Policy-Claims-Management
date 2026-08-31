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

def test_otp_forgot_password_flow():
    from app.database import SessionLocal
    from app.models import OTPRecord

    # 1. Send OTP for forgot password
    send_res = client.post("/api/auth/send-otp", json={
        "email": "customer@insurance.com",
        "purpose": "FORGOT_PASSWORD"
    })
    assert send_res.status_code == 200
    assert send_res.json()["status"] == "success"

    # 2. Retrieve generated OTP from DB for testing
    db = SessionLocal()
    otp_record = db.query(OTPRecord).filter(
        OTPRecord.email == "customer@insurance.com",
        OTPRecord.purpose == "FORGOT_PASSWORD"
    ).first()
    assert otp_record is not None
    otp_code = otp_record.otp_code
    db.close()

    # 3. Verify OTP
    verify_res = client.post("/api/auth/verify-otp", json={
        "email": "customer@insurance.com",
        "otp": otp_code,
        "purpose": "FORGOT_PASSWORD"
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "success"

    # 4. Reset Password
    reset_res = client.post("/api/auth/reset-password", json={
        "email": "customer@insurance.com",
        "otp": otp_code,
        "new_password": "NewCustomerPassword@123"
    })
    assert reset_res.status_code == 200
    assert reset_res.json()["status"] == "success"

    # 5. Login with New Password
    login_new = client.post("/api/auth/login", json={
        "email": "customer@insurance.com",
        "password": "NewCustomerPassword@123"
    })
    assert login_new.status_code == 200
    assert "access_token" in login_new.json()

    # 6. Restore demo default password
    from app.dependencies import get_password_hash
    db = SessionLocal()
    u = db.query(User).filter(User.email == "customer@insurance.com").first()
    if u:
        u.hashed_password = get_password_hash("Customer@123")
        db.commit()
    db.close()

def test_admin_policy_crud():
    # 1. Admin login
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@insurance.com",
        "password": "Admin@123"
    })
    assert admin_login.status_code == 200
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List policies
    list_res = client.get("/api/admin/policies", headers=headers)
    assert list_res.status_code == 200
    data = list_res.json()
    assert "items" in data
    assert len(data["items"]) > 0

    # 3. Create a new Policy
    create_payload = {
        "policy_number": "CAT-TEST-999",
        "name": "Health Care Shield Pro Max",
        "type": "HEALTH",
        "description": "Comprehensive health protection with hospital coverage",
        "premium": 13000.0,
        "duration_months": 12,
        "status": "ACTIVE"
    }
    create_res = client.post("/api/admin/policies", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    created_policy = create_res.json()
    assert created_policy["name"] == "Health Care Shield Pro Max"
    assert created_policy["premium"] == 13000.0
    assert created_policy["status"] == "ACTIVE"
    policy_id = created_policy["id"]

    # 4. Update Policy (Modifying premium to 15000 and name as in screenshot)
    update_payload = {
        "policy_number": f"CAT-{policy_id:03d}",
        "name": "Health Care Shield Pro Updated",
        "type": "HEALTH",
        "description": "Updated premium and benefits",
        "premium": 15000.0,
        "duration_months": 12,
        "status": "ACTIVE"
    }
    update_res = client.put(f"/api/admin/policies/{policy_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["name"] == "Health Care Shield Pro Updated"
    assert updated_data["premium"] == 15000.0

    # 5. Toggle Policy Status
    status_res = client.patch(f"/api/admin/policies/{policy_id}/status", json={"status": "INACTIVE"}, headers=headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "INACTIVE"

    # 6. Delete Policy
    delete_res = client.delete(f"/api/admin/policies/{policy_id}", headers=headers)
    assert delete_res.status_code == 200
    assert "deleted successfully" in delete_res.json()["message"]


