from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Policy, Claim, PolicyStatus, ClaimStatus
from app.dependencies import require_agent

router = APIRouter(prefix="/api/agent/dashboard", tags=["Agent Dashboard"])

@router.get("")
def get_agent_dashboard(
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    aid = agent.id

    # Assigned policies (or all policies if agent handles all)
    assigned_policies = db.query(Policy).filter((Policy.agent_id == aid) | (Policy.agent_id == None)).all()
    active_policies = [p for p in assigned_policies if p.status == PolicyStatus.ACTIVE]
    expired_policies = [p for p in assigned_policies if p.status == PolicyStatus.EXPIRED]

    # Assigned customers (unique)
    customer_ids = set(p.customer_id for p in assigned_policies if p.customer_id)
    total_customers = len(customer_ids)

    # Claims related to assigned policies
    policy_ids = [p.id for p in assigned_policies]
    claims = db.query(Claim).filter(Claim.policy_id.in_(policy_ids)).all() if policy_ids else []
    pending_claims = [c for c in claims if c.status in [ClaimStatus.FILED, ClaimStatus.UNDER_REVIEW]]
    approved_claims = [c for c in claims if c.status == ClaimStatus.APPROVED]

    # Expiring soon (within 30 days)
    now = datetime.utcnow()
    expiring_soon = [p for p in active_policies if p.valid_until and (p.valid_until - now).days <= 30]

    # Purchases by status for chart
    purchases_by_status = {
        "ACTIVE": len(active_policies),
        "EXPIRED": len(expired_policies),
        "CANCELLED": len([p for p in assigned_policies if p.status == PolicyStatus.CANCELLED]),
    }

    # Claims by status for chart
    claims_by_status = {
        "SUBMITTED": len([c for c in claims if c.status == ClaimStatus.FILED]),
        "UNDER_REVIEW": len([c for c in claims if c.status == ClaimStatus.UNDER_REVIEW]),
        "APPROVED": len(approved_claims),
        "REJECTED": len([c for c in claims if c.status == ClaimStatus.REJECTED]),
    }

    # Recent purchases
    recent_policies = sorted(assigned_policies, key=lambda x: x.created_at, reverse=True)[:5]
    recent_purchases_out = []
    for p in recent_policies:
        cat_str = p.category.value if hasattr(p.category, 'value') else str(p.category)
        st_str = p.status.value if hasattr(p.status, 'value') else str(p.status)
        recent_purchases_out.append({
            "id": p.id,
            "policy_number": p.policy_number,
            "policy_name": p.title,
            "policy_type": cat_str,
            "customer_name": p.customer.name if p.customer else "N/A",
            "premium": p.premium_amount,
            "start_date": p.valid_from,
            "end_date": p.valid_until,
            "status": st_str,
        })

    return {
        "agent_name": agent.name,
        "total_customers": total_customers,
        "total_purchases": len(assigned_policies),
        "active_purchases": len(active_policies),
        "expired_purchases": len(expired_policies),
        "expiring_soon": len(expiring_soon),
        "total_claims": len(claims),
        "pending_claims": len(pending_claims),
        "approved_claims": len(approved_claims),
        "purchases_by_status": purchases_by_status,
        "claims_by_status": claims_by_status,
        "recent_purchases": recent_purchases_out,
    }
