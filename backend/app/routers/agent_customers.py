from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, Policy, Claim, PolicyStatus, UserRole
from app.dependencies import require_agent

router = APIRouter(prefix="/api/agent/customers", tags=["Agent Customers"])

@router.get("")
def get_assigned_customers(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    aid = agent.id

    # Get customers
    purchases = db.query(Policy).filter((Policy.agent_id == aid) | (Policy.agent_id == None)).all()
    customer_ids = list(set(p.customer_id for p in purchases if p.customer_id))

    if not customer_ids:
        # Fallback to all customer accounts
        all_custs = db.query(User).filter(User.role == UserRole.CUSTOMER).all()
        customer_ids = [c.id for c in all_custs]

    if not customer_ids:
        return {"items": [], "total": 0, "page": page, "page_size": page_size}

    query = db.query(User).filter(User.id.in_(customer_ids))

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(User.name.ilike(search_term), User.email.ilike(search_term))
        )

    total = query.count()
    customers = query.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for c in customers:
        cust_purchases = [p for p in purchases if p.customer_id == c.id]
        active_count = len([p for p in cust_purchases if p.status == PolicyStatus.ACTIVE])
        purchase_ids = [p.id for p in cust_purchases]
        claims_count = db.query(Claim).filter(Claim.policy_id.in_(purchase_ids)).count() if purchase_ids else 0

        items.append({
            "id": c.id,
            "full_name": c.name,
            "email": c.email,
            "phone": c.phone,
            "is_active": getattr(c, 'is_active', True),
            "policies_count": len(cust_purchases),
            "active_policies": active_count,
            "claims_count": claims_count,
        })

    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/{customer_id}")
def get_customer_detail(
    customer_id: int,
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    customer = db.query(User).filter(User.id == customer_id, User.role == UserRole.CUSTOMER).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    purchases = db.query(Policy).filter(Policy.customer_id == customer_id).all()

    purchases_out = []
    for p in purchases:
        cat_str = p.category.value if hasattr(p.category, 'value') else str(p.category)
        st_str = p.status.value if hasattr(p.status, 'value') else str(p.status)
        claims = db.query(Claim).filter(Claim.policy_id == p.id).all()
        purchases_out.append({
            "id": p.id,
            "policy_number": p.policy_number,
            "policy_name": p.title,
            "policy_type": cat_str,
            "premium": p.premium_amount,
            "start_date": p.valid_from,
            "end_date": p.valid_until,
            "status": st_str,
            "claims": [{
                "id": clm.id,
                "claim_number": clm.claim_number,
                "amount": clm.amount_claimed,
                "reason": clm.description,
                "status": clm.status.value if hasattr(clm.status, 'value') else str(clm.status),
                "claim_date": clm.filed_at,
            } for clm in claims],
        })

    return {
        "customer": {
            "id": customer.id,
            "full_name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "is_active": getattr(customer, 'is_active', True),
            "created_at": customer.created_at,
        },
        "purchases": purchases_out,
    }
