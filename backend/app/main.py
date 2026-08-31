import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app.models import (
    User, UserRole, PolicyCatalog, Policy, Claim, Notification,
    PolicyStatus, ClaimStatus, PolicyCategory, ClaimReview, Document, AuditLog
)
from app.dependencies import get_password_hash

# --- Auto-generated imports ---
from app.routers import admin_agents
from app.routers import admin_audit
from app.routers import admin_claims
from app.routers import admin_customers
from app.routers import admin_dashboard
from app.routers import admin_documents
from app.routers import admin_officers
from app.routers import admin_policies
from app.routers import admin_purchases
from app.routers import admin_reports
from app.routers import admin_users
from app.routers import agent_claims
from app.routers import agent_customers
from app.routers import agent_dashboard
from app.routers import agent_notifications
from app.routers import agent_profile
from app.routers import agent_purchases
from app.routers import analytics_router
from app.routers import auth
from app.routers import auth_router
from app.routers import claims_router
from app.routers import customer_claims
from app.routers import customer_dashboard
from app.routers import customer_documents
from app.routers import customer_notifications
from app.routers import customer_policies
from app.routers import customer_profile
from app.routers import customer_purchases
from app.routers import notifications_router
from app.routers import officer_claims
from app.routers import officer_dashboard
from app.routers import officer_notifications
from app.routers import officer_profile
from app.routers import officer_reviews
from app.routers import policies_router
from app.routers import users_router

app = FastAPI(title="InsurCare Insurance & Claims Engine API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(admin_agents.router)
app.include_router(admin_audit.router)
app.include_router(admin_claims.router)
app.include_router(admin_customers.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_documents.router)
app.include_router(admin_officers.router)
app.include_router(admin_policies.router)
app.include_router(admin_purchases.router)
app.include_router(admin_reports.router)
app.include_router(admin_users.router)
app.include_router(agent_claims.router)
app.include_router(agent_customers.router)
app.include_router(agent_dashboard.router)
app.include_router(agent_notifications.router)
app.include_router(agent_profile.router)
app.include_router(agent_purchases.router)
app.include_router(analytics_router.router)
app.include_router(auth.router)
app.include_router(auth_router.router)
app.include_router(claims_router.router)
app.include_router(customer_claims.router)
app.include_router(customer_dashboard.router)
app.include_router(customer_documents.router)
app.include_router(customer_notifications.router)
app.include_router(customer_policies.router)
app.include_router(customer_profile.router)
app.include_router(customer_purchases.router)
app.include_router(notifications_router.router)
app.include_router(officer_claims.router)
app.include_router(officer_dashboard.router)
app.include_router(officer_notifications.router)
app.include_router(officer_profile.router)
app.include_router(officer_reviews.router)
app.include_router(policies_router.router)
app.include_router(users_router.router)


@app.get("/")
def root():
    return {
        "status": "Online",
        "system": "InsurCare Insurance & Claims Management Engine",
        "agent": "Priya Nair (Verified Insurance Agent)"
    }

# Comprehensive Seed DB Function
def seed_database():
    import sqlalchemy
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate is_active column on policy_catalogs if missing
    try:
        with engine.begin() as conn:
            conn.execute(sqlalchemy.text("ALTER TABLE policy_catalogs ADD COLUMN is_active BOOLEAN DEFAULT 1"))
    except Exception:
        pass

    db: Session = SessionLocal()
    try:
        # 1. Seed Admin
        admin = db.query(User).filter(User.email == "admin@insurance.com").first()
        if not admin:
            admin = User(
                name="System Administrator",
                email="admin@insurance.com",
                phone="+91 98765 00000",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN
            )
            db.add(admin)

        # 2. Seed Agent
        agent = db.query(User).filter(User.email == "agent@insurance.com").first()
        if not agent:
            agent = User(
                name="Rajesh Sharma",
                email="agent@insurance.com",
                phone="+91 98765 00001",
                hashed_password=get_password_hash("Agent@123"),
                role=UserRole.AGENT
            )
            db.add(agent)

        agent2 = db.query(User).filter(User.email == "agent@insure.com").first()
        if not agent2:
            agent2 = User(
                name="Priya Nair",
                email="agent@insure.com",
                phone="+91 98765 00002",
                hashed_password=get_password_hash("password123"),
                role=UserRole.AGENT
            )
            db.add(agent2)

        # 3. Seed Claims Officer
        officer = db.query(User).filter(User.email == "officer@insurance.com").first()
        if not officer:
            officer = User(
                name="Sanjay Verma",
                email="officer@insurance.com",
                phone="+91 98765 00003",
                hashed_password=get_password_hash("Officer@123"),
                role=UserRole.CLAIMS_OFFICER
            )
            db.add(officer)

        # 4. Seed Customers
        customers_data = [
            {"name": "Rahul Verma", "email": "customer@insurance.com", "phone": "+91 98765 43212"},
            {"name": "Ramesh Kumar", "email": "ramesh@example.com", "phone": "+91 98765 43210"},
            {"name": "Sunita Sharma", "email": "sunita@example.com", "phone": "+91 98765 43211"},
            {"name": "Ananya Roy", "email": "ananya@example.com", "phone": "+91 98765 43213"},
        ]
        
        customer_objs = []
        for cdata in customers_data:
            cust = db.query(User).filter(User.email == cdata["email"]).first()
            if not cust:
                cust = User(
                    name=cdata["name"],
                    email=cdata["email"],
                    phone=cdata["phone"],
                    hashed_password=get_password_hash("Customer@123" if cdata["email"] == "customer@insurance.com" else "password123"),
                    role=UserRole.CUSTOMER
                )
                db.add(cust)
                db.commit()
                db.refresh(cust)
            customer_objs.append(cust)

        db.commit()

        # 5. Seed Policy Catalogs
        if db.query(PolicyCatalog).count() == 0:
            catalogs = [
                PolicyCatalog(
                    title="Health Care Shield Pro",
                    category=PolicyCategory.Health,
                    description="Comprehensive medical coverage with 100% cashless hospital network, zero copay, and organ donor protection.",
                    base_premium=12500.0,
                    coverage_amount=1000000.0,
                    features="Cashless Treatment, Day Care Coverage, Free Annual Health Checkup, Ambulance Cover",
                    bestseller_tag=True
                ),
                PolicyCatalog(
                    title="Super Car Secure 360",
                    category=PolicyCategory.Auto,
                    description="Comprehensive motor protection including Zero Depreciation, engine protection, and 24x7 roadside assistance.",
                    base_premium=8900.0,
                    coverage_amount=750000.0,
                    features="Zero Depreciation, Key Replacement, Roadside Assistance, Personal Accident Cover",
                    bestseller_tag=True
                ),
                PolicyCatalog(
                    title="Term Life Super Suraksha",
                    category=PolicyCategory.Life,
                    description="Pure term life protection providing financial sovereignty to family with critical illness rider.",
                    base_premium=18200.0,
                    coverage_amount=15000000.0,
                    features="Tax Benefits u/s 80C, Terminal Illness Payout, Waiver of Premium",
                    bestseller_tag=True
                ),
                PolicyCatalog(
                    title="Complete Home Protection",
                    category=PolicyCategory.Home,
                    description="Guarantees structure and contents against fire, natural disasters, theft, and short circuit damage.",
                    base_premium=5400.0,
                    coverage_amount=5000000.0,
                    features="Structure & Contents, Burglary Cover, Earthquake Protection",
                    bestseller_tag=False
                )
            ]
            db.add_all(catalogs)
            db.commit()

        # 6. Seed Issued Policies
        if db.query(Policy).count() == 0:
            cat_health = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Health).first()
            cat_auto = db.query(PolicyCatalog).filter(PolicyCategory.Auto == PolicyCatalog.category).first()
            cat_life = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Life).first()
            cat_home = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Home).first()

            now = datetime.datetime.utcnow()
            agent_user = db.query(User).filter(User.role == UserRole.AGENT).first()
            
            policies = [
                Policy(
                    policy_number="POL-HEA-108492",
                    customer_id=customer_objs[0].id,
                    agent_id=agent_user.id if agent_user else None,
                    catalog_id=cat_health.id if cat_health else None,
                    title="Health Care Shield Pro",
                    category=PolicyCategory.Health,
                    premium_amount=12500.0,
                    coverage_amount=1000000.0,
                    status=PolicyStatus.ACTIVE,
                    valid_from=now - datetime.timedelta(days=180),
                    valid_until=now + datetime.timedelta(days=185),
                    last_reminder_sent=now - datetime.timedelta(days=10)
                ),
                Policy(
                    policy_number="POL-AUT-782103",
                    customer_id=customer_objs[1].id,
                    agent_id=agent_user.id if agent_user else None,
                    catalog_id=cat_auto.id if cat_auto else None,
                    title="Super Car Secure 360",
                    category=PolicyCategory.Auto,
                    premium_amount=8900.0,
                    coverage_amount=750000.0,
                    status=PolicyStatus.ACTIVE,
                    valid_from=now - datetime.timedelta(days=330),
                    valid_until=now + datetime.timedelta(days=35),
                    last_reminder_sent=None
                ),
                Policy(
                    policy_number="POL-LIF-991204",
                    customer_id=customer_objs[2].id,
                    agent_id=agent_user.id if agent_user else None,
                    catalog_id=cat_life.id if cat_life else None,
                    title="Term Life Super Suraksha",
                    category=PolicyCategory.Life,
                    premium_amount=18200.0,
                    coverage_amount=15000000.0,
                    status=PolicyStatus.ACTIVE,
                    valid_from=now - datetime.timedelta(days=60),
                    valid_until=now + datetime.timedelta(days=305),
                    last_reminder_sent=None
                ),
                Policy(
                    policy_number="POL-HOM-442109",
                    customer_id=customer_objs[3].id,
                    agent_id=agent_user.id if agent_user else None,
                    catalog_id=cat_home.id if cat_home else None,
                    title="Complete Home Protection",
                    category=PolicyCategory.Home,
                    premium_amount=5400.0,
                    coverage_amount=5000000.0,
                    status=PolicyStatus.EXPIRED,
                    valid_from=now - datetime.timedelta(days=400),
                    valid_until=now - datetime.timedelta(days=35),
                    last_reminder_sent=now - datetime.timedelta(days=40)
                )
            ]
            db.add_all(policies)
            db.commit()

        # 7. Seed Claims & Reviews
        if db.query(Claim).count() == 0:
            pol1 = db.query(Policy).filter(Policy.policy_number == "POL-HEA-108492").first()
            if pol1:
                claim1 = Claim(
                    claim_number="CLM-982310",
                    policy_id=pol1.id,
                    customer_id=pol1.customer_id,
                    incident_date=datetime.datetime.utcnow() - datetime.timedelta(days=20),
                    amount_claimed=45000.0,
                    description="Emergency hospital admission for acute appendicitis surgery.",
                    status=ClaimStatus.UNDER_REVIEW,
                    risk_score=18.5,
                    document_name="Hospital_Discharge_Summary.pdf"
                )
                db.add(claim1)

                pol2 = db.query(Policy).filter(Policy.policy_number == "POL-AUT-782103").first()
                if pol2:
                    claim2 = Claim(
                        claim_number="CLM-982311",
                        policy_id=pol2.id,
                        customer_id=pol2.customer_id,
                        incident_date=datetime.datetime.utcnow() - datetime.timedelta(days=40),
                        amount_claimed=12000.0,
                        description="Bumper damage repaired at authorized cashless workshop.",
                        status=ClaimStatus.APPROVED,
                        risk_score=8.2,
                        document_name="Car_Repair_Bill.pdf"
                    )
                    db.add(claim2)

                db.commit()

    finally:
        db.close()

seed_database()

# Production Frontend Hosting (e.g. PythonAnywhere / Docker / Cloud)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
frontend_dist = os.path.join(base_dir, "frontend", "dist")
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(frontend_dist):
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        # Allow API routes to be handled by routers
        if full_path.startswith("api/") or full_path == "docs" or full_path == "openapi.json":
            return None
        target = os.path.join(frontend_dist, full_path)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Frontend build not found", "hint": "Run npm run build in frontend directory"}

