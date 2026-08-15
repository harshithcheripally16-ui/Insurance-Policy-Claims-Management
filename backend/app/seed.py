from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import (
    User, UserRole, PolicyCatalog, Policy, PolicyStatus,
    Claim, ClaimStatus, Document, DocType, VerificationStatus, Notification
)
from app.auth import get_password_hash
from app.services.risk_engine import calculate_claim_risk

def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("[SEED] Seeding Indian Users...")
    hashed_password = get_password_hash("password123")

    admin = User(
        email="admin@insure.com",
        password_hash=hashed_password,
        full_name="Aarav Sharma",
        role=UserRole.ADMIN,
        phone="+91 98765 43210",
        address="402 Cyber City, DLF Phase 2, Gurugram, Haryana"
    )
    officer = User(
        email="officer@insure.com",
        password_hash=hashed_password,
        full_name="Rajesh Kulkarni",
        role=UserRole.CLAIMS_OFFICER,
        phone="+91 98765 43211",
        address="102 Commercial Street, Indiranagar, Bengaluru, Karnataka"
    )
    agent = User(
        email="agent@insure.com",
        password_hash=hashed_password,
        full_name="Priya Nair",
        role=UserRole.AGENT,
        phone="+91 98765 43212",
        address="501 BKC Towers, Bandra Kurla Complex, Mumbai, Maharashtra"
    )
    customer = User(
        email="customer@insure.com",
        password_hash=hashed_password,
        full_name="Vikram Patel",
        role=UserRole.CUSTOMER,
        phone="+91 98765 43213",
        address="742 MG Road, Satellite, Ahmedabad, Gujarat"
    )
    customer2 = User(
        email="johndoe@gmail.com",
        password_hash=hashed_password,
        full_name="Amitabh Verma",
        role=UserRole.CUSTOMER,
        phone="+91 98765 43214",
        address="123 Park Street, Kolkata, West Bengal"
    )

    db.add_all([admin, officer, agent, customer, customer2])
    db.commit()

    print("[SEED] Seeding Indian Policy Catalog...")
    c1 = PolicyCatalog(
        code="POL-HLTH-01",
        title="Comprehensive Swasthya Shield",
        type="Health",
        description="Full medical, surgical, and emergency hospital coverage with cashless treatment at 10,000+ network hospitals.",
        base_premium=15000.00,
        max_coverage=500000.00,
        term_months=12
    )
    c2 = PolicyCatalog(
        code="POL-AUTO-02",
        title="Premium Vahan Comprehensive Guard",
        type="Auto",
        description="Complete protection against collision, theft, third-party liability, and 24x7 roadside assistance in India.",
        base_premium=12000.00,
        max_coverage=300000.00,
        term_months=12
    )
    c3 = PolicyCatalog(
        code="POL-HOME-03",
        title="Griha Raksha Sentinel",
        type="Home",
        description="Protection for residential structure, home contents, flood, earthquake, and natural hazard events.",
        base_premium=18000.00,
        max_coverage=2500000.00,
        term_months=12
    )
    c4 = PolicyCatalog(
        code="POL-LIFE-04",
        title="Jeevan Suraksha Term Plan",
        type="Life",
        description="Financial security for your family with fixed annual premium rates and guaranteed lump-sum payout.",
        base_premium=9500.00,
        max_coverage=5000000.00,
        term_months=12
    )
    db.add_all([c1, c2, c3, c4])
    db.commit()

    print("[SEED] Seeding Purchased Policies...")
    now = datetime.now()
    p1 = Policy(
        policy_number="POL-2026-88192",
        type="Health",
        title="Comprehensive Swasthya Shield",
        coverage_amount=500000.00,
        premium=15000.00,
        start_date=now - timedelta(days=120),
        end_date=now + timedelta(days=245),
        status=PolicyStatus.ACTIVE,
        customer_id=customer.id,
        agent_id=agent.id,
        catalog_id=c1.id
    )
    p2 = Policy(
        policy_number="POL-2026-40291",
        type="Auto",
        title="Premium Vahan Comprehensive Guard",
        coverage_amount=300000.00,
        premium=12000.00,
        start_date=now - timedelta(days=10),
        end_date=now + timedelta(days=355),
        status=PolicyStatus.ACTIVE,
        customer_id=customer.id,
        agent_id=agent.id,
        catalog_id=c2.id
    )
    p3 = Policy(
        policy_number="POL-2026-11920",
        type="Home",
        title="Griha Raksha Sentinel",
        coverage_amount=2500000.00,
        premium=18000.00,
        start_date=now - timedelta(days=200),
        end_date=now + timedelta(days=165),
        status=PolicyStatus.ACTIVE,
        customer_id=customer2.id,
        agent_id=agent.id,
        catalog_id=c3.id
    )
    db.add_all([p1, p2, p3])
    db.commit()

    print("[SEED] Seeding Claims with Automated Risk Assessment...")
    # Low Risk Claim
    risk1 = calculate_claim_risk(
        claim_amount=45000.00,
        max_coverage=p1.coverage_amount,
        policy_start_date=p1.start_date,
        incident_date=now - timedelta(days=15),
        doc_count=1,
        recent_claims_count=0
    )
    cl1 = Claim(
        claim_number="CLM-2026-10492",
        reason="Apollo Hospital Outpatient Surgical Expense",
        description="Emergency room visit and minor prescription medication after routine injury at Apollo Hospital.",
        amount=45000.00,
        incident_date=now - timedelta(days=15),
        status=ClaimStatus.UNDER_REVIEW,
        risk_score=risk1["risk_score"],
        risk_level=risk1["risk_level"],
        fraud_flags=risk1["fraud_flags"],
        policy_id=p1.id,
        customer_id=customer.id
    )

    # High Risk Claim (Incident close to start date + high coverage ratio)
    risk2 = calculate_claim_risk(
        claim_amount=260000.00,
        max_coverage=p2.coverage_amount,
        policy_start_date=p2.start_date,
        incident_date=now - timedelta(days=5),
        doc_count=0,
        recent_claims_count=1
    )
    cl2 = Claim(
        claim_number="CLM-2026-99381",
        reason="NH-48 Highway Vehicle Collision Claim",
        description="Major highway collision on NH-48 resulting in severe vehicle damage 5 days after policy purchase.",
        amount=260000.00,
        incident_date=now - timedelta(days=5),
        status=ClaimStatus.SUBMITTED,
        risk_score=risk2["risk_score"],
        risk_level=risk2["risk_level"],
        fraud_flags=risk2["fraud_flags"],
        policy_id=p2.id,
        customer_id=customer.id
    )

    # Approved Claim
    cl3 = Claim(
        claim_number="CLM-2026-30291",
        reason="Monsoon Water Leak Structural Damage",
        description="Heavy monsoon rainfall causing ceiling water leak and wooden floorboard replacement.",
        amount=85000.00,
        incident_date=now - timedelta(days=60),
        status=ClaimStatus.APPROVED,
        risk_score=15,
        risk_level="LOW",
        fraud_flags="[]",
        policy_id=p3.id,
        customer_id=customer2.id
    )

    db.add_all([cl1, cl2, cl3])
    db.commit()

    print("[SEED] Seeding Sample Document Attachments...")
    doc1 = Document(
        file_name="apollo_hospital_bill_receipt_102.pdf",
        file_path="uploads/demo_hospital_receipt.pdf",
        file_type="application/pdf",
        file_size=245000,
        doc_type=DocType.RECEIPT,
        status=VerificationStatus.VERIFIED,
        notes="Verified with Apollo Hospital Billing Desk.",
        claim_id=cl1.id
    )
    db.add(doc1)

    print("[SEED] Seeding System Notifications...")
    n1 = Notification(
        user_id=customer.id,
        title="Claim Received",
        message="Your claim CLM-2026-10492 for ₹45,000.00 has been received and is undergoing Claims Officer evaluation.",
        type="CLAIM_UPDATE"
    )
    n2 = Notification(
        user_id=customer.id,
        title="High Claim Alert",
        message="Claim CLM-2026-99381 requires document verification.",
        type="CLAIM_UPDATE"
    )
    db.add_all([n1, n2])
    db.commit()

    db.close()
    print("[SUCCESS] Database successfully seeded with Indian demo accounts and data!")

if __name__ == "__main__":
    seed_db()
