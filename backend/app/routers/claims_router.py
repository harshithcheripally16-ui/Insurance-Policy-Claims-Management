import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Policy, Claim, ClaimStatus, UserRole
from app.schemas import ClaimCreate, ClaimOut, ClaimStatusUpdate
from app.dependencies import get_current_user, require_roles
from app.services.risk_engine import calculate_claim_risk_score
from app.services.notification import create_notification

router = APIRouter(prefix="/api/claims", tags=["Claims"])

@router.get("", response_model=List[ClaimOut])
def get_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Claim)
    if current_user.role == UserRole.CUSTOMER:
        q = q.filter(Claim.customer_id == current_user.id)

    claims = q.order_by(Claim.id.desc()).all()

    out_list = []
    for c in claims:
        c_dict = ClaimOut.model_validate(c)
        if c.policy:
            c_dict.policy_title = c.policy.title
        if c.customer:
            c_dict.customer_name = c.customer.name
        out_list.append(c_dict)

    return out_list

@router.post("", response_model=ClaimOut)
def file_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    policy = db.query(Policy).filter(Policy.id == claim_in.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    claim_number = f"CLM-{random.randint(100000, 999999)}"
    
    # Calculate automated risk score
    risk_score = calculate_claim_risk_score(
        db,
        policy_id=policy.id,
        amount_claimed=claim_in.amount_claimed,
        incident_date=claim_in.incident_date
    )

    new_claim = Claim(
        claim_number=claim_number,
        policy_id=policy.id,
        customer_id=policy.customer_id if current_user.role != UserRole.CUSTOMER else current_user.id,
        incident_date=claim_in.incident_date,
        amount_claimed=claim_in.amount_claimed,
        description=claim_in.description,
        status=ClaimStatus.FILED,
        risk_score=risk_score,
        document_name=claim_in.document_name or "Medical_Report_Incident.pdf"
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    # In-app notification to customer & assigned agent
    create_notification(
        db,
        user_id=new_claim.customer_id,
        title="Claim Filed Successfully",
        message=f"Claim #{new_claim.claim_number} for ₹{new_claim.amount_claimed:,.2f} is under review."
    )

    c_dict = ClaimOut.model_validate(new_claim)
    c_dict.policy_title = policy.title
    if new_claim.customer:
        c_dict.customer_name = new_claim.customer.name
    return c_dict

@router.put("/{claim_id}/status", response_model=ClaimOut)
def update_claim_status(
    claim_id: int,
    status_in: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = status_in.status
    db.commit()
    db.refresh(claim)

    create_notification(
        db,
        user_id=claim.customer_id,
        title="Claim Status Updated",
        message=f"Claim #{claim.claim_number} status has been updated to {claim.status.value}."
    )

    c_dict = ClaimOut.model_validate(claim)
    if claim.policy:
        c_dict.policy_title = claim.policy.title
    if claim.customer:
        c_dict.customer_name = claim.customer.name
    return c_dict
