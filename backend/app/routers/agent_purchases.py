from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, Policy, Claim, PolicyStatus
from app.dependencies import require_agent

router = APIRouter(prefix="/api/agent/purchases", tags=["Agent Purchases"])

@router.get("")
def get_assigned_purchases(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    aid = agent.id

    query = db.query(Policy).filter((Policy.agent_id == aid) | (Policy.agent_id == None))

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.join(User, Policy.customer_id == User.id).filter(
            or_(
                Policy.policy_number.ilike(search_term),
                Policy.title.ilike(search_term),
                User.name.ilike(search_term),
            )
        )

    if status and status.upper() in ["ACTIVE", "EXPIRED", "CANCELLED", "SUSPENDED"]:
        query = query.filter(Policy.status == status.upper())

    total = query.count()
    purchases = query.order_by(Policy.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for p in purchases:
        cust = p.customer
        claims_count = db.query(Claim).filter(Claim.policy_id == p.id).count()
        cat_str = p.category.value if hasattr(p.category, 'value') else str(p.category)
        st_str = p.status.value if hasattr(p.status, 'value') else str(p.status)
        items.append({
            "id": p.id,
            "policy_number": p.policy_number,
            "policy_name": p.title,
            "policy_type": cat_str,
            "premium": p.premium_amount,
            "customer_name": cust.name if cust else "N/A",
            "customer_email": cust.email if cust else "N/A",
            "start_date": p.valid_from,
            "end_date": p.valid_until,
            "status": st_str,
            "claims_count": claims_count,
        })

    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/{purchase_id}")
def get_purchase_detail(
    purchase_id: int,
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    purchase = db.query(Policy).filter(Policy.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Policy purchase not found")

    cust = purchase.customer
    claims = db.query(Claim).filter(Claim.policy_id == purchase.id).all()
    cat_str = purchase.category.value if hasattr(purchase.category, 'value') else str(purchase.category)
    st_str = purchase.status.value if hasattr(purchase.status, 'value') else str(purchase.status)

    return {
        "id": purchase.id,
        "policy": {
            "id": purchase.id,
            "policy_number": purchase.policy_number,
            "name": purchase.title,
            "type": cat_str,
            "premium": purchase.premium_amount,
            "duration_months": 12,
        },
        "customer": {
            "id": cust.id if cust else None,
            "full_name": cust.name if cust else "N/A",
            "email": cust.email if cust else "N/A",
            "phone": cust.phone if cust else None,
        },
        "start_date": purchase.valid_from,
        "end_date": purchase.valid_until,
        "status": st_str,
        "claims": [{
            "id": c.id,
            "claim_number": c.claim_number,
            "amount": c.amount_claimed,
            "reason": c.description,
            "status": c.status.value if hasattr(c.status, 'value') else str(c.status),
            "claim_date": c.filed_at,
        } for c in claims],
    }
