from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Policy, User, Claim, UserRole
from app.schemas import (
    PurchaseDetailOut,
    PurchaseListResponse,
    PurchaseCustomerOut,
    PurchasePolicyOut,
    PurchaseAgentOut
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/admin/policy-purchases", tags=["Admin Policy Purchases"])

def format_purchase_detail(p: Policy, db: Session) -> PurchaseDetailOut:
    customer_data = None
    if p.customer:
        customer_data = PurchaseCustomerOut(
            id=p.customer.id,
            full_name=p.customer.name,
            email=p.customer.email,
            phone=p.customer.phone
        )

    cat_str = p.category.value.upper() if hasattr(p.category, 'value') else str(p.category).upper()
    policy_data = PurchasePolicyOut(
        id=p.id,
        policy_number=p.policy_number,
        name=p.title,
        type=cat_str,
        premium=p.premium_amount,
        duration_months=12
    )

    agent_data = None
    if p.agent:
        agent_data = PurchaseAgentOut(
            id=p.agent.id,
            full_name=p.agent.name,
            email=p.agent.email
        )

    claims_count = db.query(Claim).filter(Claim.policy_id == p.id).count()

    st_str = p.status.value.upper() if hasattr(p.status, 'value') else str(p.status).upper()
    return PurchaseDetailOut(
        id=p.id,
        policy_id=p.id,
        customer_id=p.customer_id,
        agent_id=p.agent_id,
        start_date=p.valid_from,
        end_date=p.valid_until,
        status=st_str,
        created_at=p.created_at,
        customer=customer_data,
        policy=policy_data,
        agent=agent_data,
        claims_count=claims_count
    )

@router.get("", response_model=PurchaseListResponse)
def list_policy_purchases(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    query = db.query(Policy).join(Policy.customer)

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                Policy.policy_number.ilike(search_term),
                Policy.title.ilike(search_term)
            )
        )

    total = query.count()
    purchases = query.order_by(Policy.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_purchase_detail(p, db) for p in purchases]

    return PurchaseListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=PurchaseDetailOut)
def get_policy_purchase_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    purchase = db.query(Policy).filter(Policy.id == id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Policy purchase record not found")
    return format_purchase_detail(purchase, db)
