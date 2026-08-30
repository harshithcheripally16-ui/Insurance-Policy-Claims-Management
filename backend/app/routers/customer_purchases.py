import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PolicyCatalog, Policy, PolicyStatus, User, UserRole, Claim
from app.schemas import (
    CustomerPurchaseCreate,
    CustomerPurchaseOut,
    CustomerPurchaseDetailOut
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/customer/purchases", tags=["Customer Policy Purchases"])

@router.post("", response_model=CustomerPurchaseDetailOut, status_code=status.HTTP_201_CREATED)
def purchase_policy(
    payload: CustomerPurchaseCreate,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    catalog = db.query(PolicyCatalog).filter(PolicyCatalog.id == payload.policy_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Insurance policy plan not found.")

    start_time = datetime.utcnow()
    end_time = start_time + timedelta(days=365)

    random_num = random.randint(100000, 999999)
    cat_code = catalog.category.value[:3].upper() if hasattr(catalog.category, 'value') else "GEN"
    pol_num = f"POL-{cat_code}-{random_num}"

    new_policy = Policy(
        policy_number=pol_num,
        customer_id=current_customer.id,
        agent_id=None,
        catalog_id=catalog.id,
        title=catalog.title,
        category=catalog.category,
        premium_amount=catalog.base_premium,
        coverage_amount=catalog.coverage_amount,
        status=PolicyStatus.ACTIVE,
        valid_from=start_time,
        valid_until=end_time
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)

    cat_str = catalog.category.value.upper() if hasattr(catalog.category, 'value') else str(catalog.category).upper()
    return CustomerPurchaseDetailOut(
        id=new_policy.id,
        policy_id=new_policy.id,
        policy_name=new_policy.title,
        policy_number=new_policy.policy_number,
        type=cat_str,
        description=catalog.description or "",
        premium=new_policy.premium_amount,
        duration_months=12,
        start_date=new_policy.valid_from,
        end_date=new_policy.valid_until,
        status="ACTIVE",
        created_at=new_policy.created_at,
        agent_name="Direct Online Purchase",
        claims=[]
    )

@router.get("", response_model=List[CustomerPurchaseOut])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    purchases = db.query(Policy).filter(
        Policy.customer_id == current_customer.id
    ).order_by(Policy.id.asc()).all()

    result = []
    for p in purchases:
        claims_count = db.query(Claim).filter(Claim.policy_id == p.id).count()
        cat_str = p.category.value.upper() if hasattr(p.category, 'value') else str(p.category).upper()
        st_str = p.status.value.upper() if hasattr(p.status, 'value') else str(p.status).upper()
        result.append(CustomerPurchaseOut(
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

    return result

@router.get("/{id}", response_model=CustomerPurchaseDetailOut)
def get_my_purchase_details(
    id: int,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    purchase = db.query(Policy).filter(
        Policy.id == id,
        Policy.customer_id == current_customer.id
    ).first()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy purchase record not found or access denied."
        )

    claims = db.query(Claim).filter(Claim.policy_id == purchase.id).all()
    claims_list = [
        {
            "id": c.id,
            "claim_number": c.claim_number,
            "reason": c.description,
            "amount": c.amount_claimed,
            "claim_date": c.filed_at,
            "status": c.status.value if hasattr(c.status, 'value') else str(c.status)
        }
        for c in claims
    ]

    agent_name = purchase.agent.name if purchase.agent else "Direct Online Purchase"
    cat_str = purchase.category.value.upper() if hasattr(purchase.category, 'value') else str(purchase.category).upper()
    st_str = purchase.status.value.upper() if hasattr(purchase.status, 'value') else str(purchase.status).upper()

    return CustomerPurchaseDetailOut(
        id=purchase.id,
        policy_id=purchase.id,
        policy_name=purchase.title,
        policy_number=purchase.policy_number,
        type=cat_str,
        description="Comprehensive policy coverage plan",
        premium=purchase.premium_amount,
        duration_months=12,
        start_date=purchase.valid_from,
        end_date=purchase.valid_until,
        status=st_str,
        created_at=purchase.created_at,
        agent_name=agent_name,
        claims=claims_list
    )
