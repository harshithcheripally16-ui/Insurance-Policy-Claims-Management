import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, PolicyCatalog, Policy, PolicyStatus
from app.schemas import (
    PolicyCatalogCreate, PolicyCatalogResponse,
    PolicyPurchaseRequest, PolicyResponse
)
from app.dependencies import get_current_user, require_roles
from app.services.notification import create_notification

router = APIRouter(prefix="/api", tags=["Policies"])

# --- POLICY CATALOG ENDPOINTS ---
@router.get("/policy-catalog", response_model=List[PolicyCatalogResponse])
def get_policy_catalog(db: Session = Depends(get_db)):
    return db.query(PolicyCatalog).filter(PolicyCatalog.is_active == True).all()

@router.post("/policy-catalog", response_model=PolicyCatalogResponse, status_code=status.HTTP_201_CREATED)
def create_policy_catalog(
    catalog_in: PolicyCatalogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    existing = db.query(PolicyCatalog).filter(PolicyCatalog.code == catalog_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Policy catalog code already exists")
    
    catalog = PolicyCatalog(**catalog_in.model_dump())
    db.add(catalog)
    db.commit()
    db.refresh(catalog)
    return catalog

# --- PURCHASED POLICIES ENDPOINTS ---
@router.get("/policies", response_model=List[PolicyResponse])
def get_policies(
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Policy)

    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(Policy.customer_id == current_user.id)
    elif current_user.role == UserRole.AGENT:
        # Agent sees policies assigned to them or customer policies
        if customer_id:
            query = query.filter(Policy.customer_id == customer_id)
    elif customer_id:
        query = query.filter(Policy.customer_id == customer_id)

    return query.order_by(Policy.id.desc()).all()

@router.post("/policies/purchase", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
def purchase_policy(
    req: PolicyPurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    catalog = db.query(PolicyCatalog).filter(PolicyCatalog.id == req.catalog_id).first()
    if not catalog:
        raise HTTPException(status_code=44, detail="Policy catalog template not found")

    target_customer_id = current_user.id
    agent_id = None

    if current_user.role in [UserRole.AGENT, UserRole.ADMIN]:
        if req.customer_id:
            target_customer_id = req.customer_id
            if current_user.role == UserRole.AGENT:
                agent_id = current_user.id

    customer = db.query(User).filter(User.id == target_customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer user not found")

    # Generate unique policy number e.g. POL-2026-88192
    policy_num = f"POL-{datetime.now().year}-{random.randint(10000, 99999)}"
    start_dt = datetime.now()
    end_dt = start_dt + timedelta(days=catalog.term_months * 30)


    policy = Policy(
        policy_number=policy_num,
        type=catalog.type,
        title=catalog.title,
        coverage_amount=catalog.max_coverage,
        premium=catalog.base_premium,
        start_date=start_dt,
        end_date=end_dt,
        status=PolicyStatus.ACTIVE,
        customer_id=target_customer_id,
        agent_id=agent_id,
        catalog_id=catalog.id
    )

    db.add(policy)
    db.commit()
    db.refresh(policy)

    create_notification(
        db=db,
        user_id=target_customer_id,
        title="New Policy Purchased",
        message=f"Your policy {policy.policy_number} ({policy.title}) has been activated successfully.",
        notification_type="POLICY"
    )

    return policy

@router.get("/policies/{id}", response_model=PolicyResponse)
def get_policy(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    if current_user.role == UserRole.CUSTOMER and policy.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this policy")

    return policy
