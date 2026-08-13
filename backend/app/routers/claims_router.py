import random
import json
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, Policy, Claim, ClaimStatus, Review, Document
from app.schemas import ClaimCreate, ClaimResponse, ReviewCreate, ReviewResponse
from app.dependencies import get_current_user, require_roles
from app.services.risk_engine import calculate_claim_risk
from app.services.notification import create_notification

router = APIRouter(prefix="/api/claims", tags=["Claims"])

@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def submit_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN]))
):
    policy = db.query(Policy).filter(Policy.id == claim_in.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if current_user.role == UserRole.CUSTOMER and policy.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only submit claims for your own policies")

    # Count recent claims on policy within 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_claims_count = db.query(Claim).filter(
        Claim.policy_id == policy.id,
        Claim.created_at >= thirty_days_ago
    ).count()

    # Calculate Automated Risk Score via Python Risk Engine
    risk_info = calculate_claim_risk(
        claim_amount=claim_in.amount,
        max_coverage=policy.coverage_amount,
        policy_start_date=policy.start_date,
        incident_date=claim_in.incident_date,
        doc_count=0, # At submission time
        recent_claims_count=recent_claims_count
    )

    claim_num = f"CLM-{datetime.now().year}-{random.randint(10000, 99999)}"

    claim = Claim(
        claim_number=claim_num,
        reason=claim_in.reason,
        description=claim_in.description,
        amount=claim_in.amount,
        incident_date=claim_in.incident_date,
        status=ClaimStatus.SUBMITTED,
        risk_score=risk_info["risk_score"],
        risk_level=risk_info["risk_level"],
        fraud_flags=risk_info["fraud_flags"],
        policy_id=policy.id,
        customer_id=policy.customer_id
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)

    create_notification(
        db=db,
        user_id=policy.customer_id,
        title="Claim Submitted",
        message=f"Claim {claim.claim_number} for ₹{claim.amount:,.2f} has been received and is under review.",
        notification_type="CLAIM_UPDATE"
    )

    return claim

@router.get("", response_model=List[ClaimResponse])
def get_claims(
    status_filter: Optional[ClaimStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Claim)

    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(Claim.customer_id == current_user.id)

    if status_filter:
        query = query.filter(Claim.status == status_filter)

    return query.order_by(Claim.id.desc()).all()

@router.get("/{id}", response_model=ClaimResponse)
def get_claim_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if current_user.role == UserRole.CUSTOMER and claim.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this claim")

    return claim

@router.post("/{id}/review", response_model=ClaimResponse)
def review_claim(
    id: int,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.CLAIMS_OFFICER, UserRole.ADMIN]))
):
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Create review record
    review = Review(
        claim_id=claim.id,
        officer_id=current_user.id,
        decision=review_in.decision,
        remarks=review_in.remarks
    )
    db.add(review)

    # Update claim status
    claim.status = review_in.decision
    db.commit()
    db.refresh(claim)

    # Notify customer
    status_str = review_in.decision.value.replace("_", " ").title()
    create_notification(
        db=db,
        user_id=claim.customer_id,
        title=f"Claim Status Update: {status_str}",
        message=f"Your claim {claim.claim_number} status has been updated to {status_str}. Remarks: {review_in.remarks}",
        notification_type="CLAIM_UPDATE"
    )

    return claim
