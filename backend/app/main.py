import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app.models import (
    User, UserRole, PolicyCatalog, Policy, Claim, Notification,
    PolicyStatus, ClaimStatus, PolicyCategory
)
from app.dependencies import get_password_hash

from app.routers import (
    auth_router, policies_router, users_router,
    claims_router, analytics_router, notifications_router
)

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InsurCare Insurance & Claims Management API",
    description="Production-ready Insurance Policy & Claims Management System API",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router)
app.include_router(policies_router.router)
app.include_router(users_router.router)
app.include_router(claims_router.router)
app.include_router(analytics_router.router)
app.include_router(notifications_router.router)

@app.get("/")
def root():
    return {
        "status": "Online",
        "system": "InsurCare Insurance & Claims Management Engine",
        "agent": "Priya Nair (Verified Insurance Agent)"
    }

# Seed DB Function
def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if agent already exists
        agent = db.query(User).filter(User.email == "agent@insure.com").first()
        if not agent:
            hashed_pwd = get_password_hash("password123")
            agent = User(
                name="Priya Nair",
                email="agent@insure.com",
                phone="+91 98765 00001",
                hashed_password=hashed_pwd,
                role=UserRole.AGENT
            )
            db.add(agent)
            db.commit()
            db.refresh(agent)

        # Seed Customers
        customers_data = [
            {"name": "Ramesh Kumar", "email": "ramesh@example.com", "phone": "+91 98765 43210"},
            {"name": "Sunita Sharma", "email": "sunita@example.com", "phone": "+91 98765 43211"},
            {"name": "Rahul Verma", "email": "rahul@example.com", "phone": "+91 98765 43212"},
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
                    hashed_password=get_password_hash("password123"),
                    role=UserRole.CUSTOMER
                )
                db.add(cust)
                db.commit()
                db.refresh(cust)
            customer_objs.append(cust)

        # Seed Policy Catalogs
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

        # Seed Policies
        if db.query(Policy).count() == 0:
            cat_health = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Health).first()
            cat_auto = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Auto).first()
            cat_life = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Life).first()
            cat_home = db.query(PolicyCatalog).filter(PolicyCatalog.category == PolicyCategory.Home).first()

            now = datetime.datetime.utcnow()
            policies = [
                Policy(
                    policy_number="POL-HEA-108492",
                    customer_id=customer_objs[0].id,
                    agent_id=agent.id,
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
                    agent_id=agent.id,
                    catalog_id=cat_auto.id if cat_auto else None,
                    title="Super Car Secure 360",
                    category=PolicyCategory.Auto,
                    premium_amount=8900.0,
                    coverage_amount=750000.0,
                    status=PolicyStatus.ACTIVE,
                    valid_from=now - datetime.timedelta(days=330),
                    valid_until=now + datetime.timedelta(days=35), # Expiring soon
                    last_reminder_sent=None
                ),
                Policy(
                    policy_number="POL-LIF-991204",
                    customer_id=customer_objs[2].id,
                    agent_id=agent.id,
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
                    agent_id=agent.id,
                    catalog_id=cat_home.id if cat_home else None,
                    title="Complete Home Protection",
                    category=PolicyCategory.Home,
                    premium_amount=5400.0,
                    coverage_amount=5000000.0,
                    status=PolicyStatus.SUSPENDED,
                    valid_from=now - datetime.timedelta(days=400),
                    valid_until=now - datetime.timedelta(days=35), # Expired
                    last_reminder_sent=now - datetime.timedelta(days=40)
                )
            ]
            db.add_all(policies)
            db.commit()

        # Seed Claims
        if db.query(Claim).count() == 0:
            pol1 = db.query(Policy).first()
            if pol1:
                claim = Claim(
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
                db.add(claim)
                db.commit()

        # Seed Notification for Priya Nair
        if db.query(Notification).count() == 0:
            notif = Notification(
                user_id=agent.id,
                title="Welcome Agent Priya Nair",
                message="Your InsurCare Insurance Portal is ready. 4 client policies are active.",
                channel="IN_APP"
            )
            db.add(notif)
            db.commit()

    finally:
        db.close()

# Seed database immediately on app load
seed_database()

