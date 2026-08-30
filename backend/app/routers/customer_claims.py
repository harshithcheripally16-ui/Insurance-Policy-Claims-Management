from datetime import datetime
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Policy, Claim, ClaimStatus, User, UserRole, Document, ClaimReview
from app.schemas import (
    CustomerClaimCreate,
    CustomerClaimOut,
    CustomerClaimDetailOut,
    DocumentOut,
    ClaimReviewOut,
    UserOut
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/customer/claims", tags=["Customer Claims"])

def generate_unique_claim_number(db: Session) -> str:
    year = datetime.now().year
    for _ in range(50):
        rand_num = random.randint(1000, 9999)
        candidate = f"CLM-{year}-{rand_num}"
        existing = db.query(Claim).filter(Claim.claim_number == candidate).first()
        if not existing:
            return candidate
    return f"CLM-{year}-{int(datetime.now().timestamp()) % 100000}"

@router.post("", response_model=CustomerClaimDetailOut, status_code=status.HTTP_201_CREATED)
def submit_claim(
    payload: CustomerClaimCreate,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    purchase = db.query(Policy).filter(
        Policy.id == payload.policy_purchase_id,
        Policy.customer_id == current_customer.id
    ).first()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valid policy purchase not found or does not belong to your account."
        )

    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Claim amount must be greater than zero."
        )

    claim_num = generate_unique_claim_number(db)
    claim_dt = payload.incident_date or datetime.utcnow()

    new_claim = Claim(
        claim_number=claim_num,
        policy_id=purchase.id,
        customer_id=current_customer.id,
        description=payload.reason.strip(),
        amount_claimed=float(payload.amount),
        incident_date=claim_dt,
        status=ClaimStatus.FILED,
        filed_at=datetime.utcnow()
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    cat_str = purchase.category.value.upper() if hasattr(purchase.category, 'value') else str(purchase.category).upper()
    return CustomerClaimDetailOut(
        id=new_claim.id,
        claim_number=new_claim.claim_number,
        policy_purchase_id=new_claim.policy_id,
        policy_name=purchase.title,
        policy_number=purchase.policy_number,
        policy_type=cat_str,
        reason=new_claim.description,
        amount=new_claim.amount_claimed,
        claim_date=new_claim.filed_at,
        status="FILED",
        created_at=new_claim.filed_at,
        updated_at=new_claim.filed_at,
        documents=[],
        reviews=[]
    )

@router.get("", response_model=List[CustomerClaimOut])
def get_my_claims(
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    claims = db.query(Claim).filter(
        Claim.customer_id == current_customer.id
    ).order_by(Claim.id.asc()).all()

    result = []
    for c in claims:
        docs_count = db.query(Document).filter(Document.claim_id == c.id).count()
        pol_name = c.policy.title if c.policy else "N/A"
        pol_num = c.policy.policy_number if c.policy else "N/A"
        st_str = c.status.value.upper() if hasattr(c.status, 'value') else str(c.status).upper()
        result.append(CustomerClaimOut(
            id=c.id,
            claim_number=c.claim_number,
            policy_purchase_id=c.policy_id,
            policy_name=pol_name,
            policy_number=pol_num,
            reason=c.description,
            amount=c.amount_claimed,
            claim_date=c.filed_at,
            status=st_str,
            created_at=c.filed_at,
            documents_count=docs_count
        ))

    return result

@router.get("/{id}", response_model=CustomerClaimDetailOut)
def get_my_claim_details(
    id: int,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    claim = db.query(Claim).filter(
        Claim.id == id,
        Claim.customer_id == current_customer.id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim record not found or access denied."
        )

    docs = db.query(Document).filter(Document.claim_id == claim.id).order_by(Document.id.asc()).all()
    docs_out = [DocumentOut.model_validate(d) for d in docs]

    reviews = db.query(ClaimReview).filter(ClaimReview.claim_id == claim.id).order_by(ClaimReview.id.asc()).all()
    reviews_out = []
    for r in reviews:
        officer_out = None
        if r.officer:
            officer_out = UserOut(
                id=r.officer.id,
                full_name=r.officer.name,
                email=r.officer.email,
                phone=r.officer.phone,
                role=r.officer.role.value if hasattr(r.officer.role, 'value') else str(r.officer.role),
                is_active=True,
                created_at=r.officer.created_at,
                updated_at=r.officer.created_at
            )
        dec_str = r.decision.value if hasattr(r.decision, 'value') else str(r.decision)
        reviews_out.append(ClaimReviewOut(
            id=r.id,
            claim_id=r.claim_id,
            officer_id=r.officer_id,
            decision=dec_str,
            remarks=r.remarks,
            review_date=r.review_date,
            officer=officer_out
        ))

    pol = claim.policy
    cat_str = pol.category.value.upper() if pol and hasattr(pol.category, 'value') else "N/A"
    st_str = claim.status.value.upper() if hasattr(claim.status, 'value') else str(claim.status).upper()

    return CustomerClaimDetailOut(
        id=claim.id,
        claim_number=claim.claim_number,
        policy_purchase_id=claim.policy_id,
        policy_name=pol.title if pol else "N/A",
        policy_number=pol.policy_number if pol else "N/A",
        policy_type=cat_str,
        reason=claim.description,
        amount=claim.amount_claimed,
        claim_date=claim.filed_at,
        status=st_str,
        created_at=claim.filed_at,
        updated_at=claim.filed_at,
        documents=docs_out,
        reviews=reviews_out
    )
