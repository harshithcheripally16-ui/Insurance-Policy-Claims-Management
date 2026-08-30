from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, Policy, PolicyStatus, Claim, ClaimStatus, Notification, Document
from app.schemas import (
    CustomerDashboardResponse,
    CustomerPurchaseOut,
    CustomerClaimOut
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/customer/dashboard", tags=["Customer Dashboard"])

@router.get("", response_model=CustomerDashboardResponse)
def get_customer_dashboard(
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    cid = current_customer.id

    # Purchases metrics
    all_purchases = db.query(Policy).filter(Policy.customer_id == cid).all()
    total_policies = len(all_purchases)
    active_policies = sum(1 for p in all_purchases if p.status == PolicyStatus.ACTIVE)
    expired_policies = sum(1 for p in all_purchases if p.status == PolicyStatus.EXPIRED)

    # Claims metrics
    all_claims = db.query(Claim).filter(Claim.customer_id == cid).all()
    total_claims = len(all_claims)
    pending_claims = sum(1 for c in all_claims if c.status in [ClaimStatus.FILED, ClaimStatus.UNDER_REVIEW])
    approved_claims = sum(1 for c in all_claims if c.status == ClaimStatus.APPROVED)
    rejected_claims = sum(1 for c in all_claims if c.status == ClaimStatus.REJECTED)

    # Unread notifications
    unread_notifs = db.query(Notification).filter(
        Notification.user_id == cid,
        Notification.is_read == False
    ).count()

    # Recent purchases (last 5)
    recent_purchases_raw = db.query(Policy).filter(
        Policy.customer_id == cid
    ).order_by(Policy.id.asc()).limit(5).all()

    recent_purchases = []
    for p in recent_purchases_raw:
        claims_count = db.query(Claim).filter(Claim.policy_id == p.id).count()
        cat_str = p.category.value.upper() if hasattr(p.category, 'value') else str(p.category).upper()
        st_str = p.status.value.upper() if hasattr(p.status, 'value') else str(p.status).upper()
        recent_purchases.append(CustomerPurchaseOut(
            id=p.id,
            policy_id=p.id,
            policy_name=p.title,
            policy_number=p.policy_number,
            type=cat_str,
            premium=p.premium_amount,
            duration_months=12,
            start_date=p.valid_from,
            end_date=p.valid_until,
            status=st_str,
            created_at=p.created_at,
            claims_count=claims_count
        ))

    # Recent claims (last 5)
    recent_claims_raw = db.query(Claim).filter(
        Claim.customer_id == cid
    ).order_by(Claim.id.asc()).limit(5).all()

    recent_claims = []
    for c in recent_claims_raw:
        docs_count = db.query(Document).filter(Document.claim_id == c.id).count()
        pol_name = c.policy.title if c.policy else "N/A"
        pol_num = c.policy.policy_number if c.policy else "N/A"
        st_str = c.status.value.upper() if hasattr(c.status, 'value') else str(c.status).upper()
        recent_claims.append(CustomerClaimOut(
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

    return CustomerDashboardResponse(
        customer_name=current_customer.name,
        total_policies=total_policies,
        active_policies=active_policies,
        expired_policies=expired_policies,
        total_claims=total_claims,
        pending_claims=pending_claims,
        approved_claims=approved_claims,
        rejected_claims=rejected_claims,
        unread_notifications=unread_notifs,
        recent_purchases=recent_purchases,
        recent_claims=recent_claims
    )
