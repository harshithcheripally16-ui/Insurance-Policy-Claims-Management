import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, PolicyCatalog, Policy, PolicyStatus
from app.schemas import (
    PolicyCatalogCreate, PolicyCatalogResponse,
    PolicyPurchaseRequest, PolicyUpdateRequest, PolicyResponse
)
from app.dependencies import get_current_user, require_roles
from app.services.notification import create_notification
from app.services.smtp_service import send_policy_reminder_email

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

# --- PURCHASED / MANAGED POLICIES ENDPOINTS ---
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
        raise HTTPException(status_code=404, detail="Policy catalog template not found")

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

@router.put("/policies/{id}", response_model=PolicyResponse)
def update_policy(
    id: int,
    req: PolicyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.AGENT, UserRole.ADMIN]))
):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(policy, field, val)

    db.commit()
    db.refresh(policy)

    create_notification(
        db=db,
        user_id=policy.customer_id,
        title="Policy Updated",
        message=f"Your policy {policy.policy_number} parameters have been updated by your Insurance Agent.",
        notification_type="POLICY"
    )

    return policy

@router.delete("/policies/{id}", status_code=status.HTTP_200_OK)
def delete_policy(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.AGENT, UserRole.ADMIN]))
):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    policy_num = policy.policy_number
    cust_id = policy.customer_id

    db.delete(policy)
    db.commit()

    create_notification(
        db=db,
        user_id=cust_id,
        title="Policy Cancelled",
        message=f"Your policy {policy_num} has been terminated/deleted.",
        notification_type="POLICY"
    )

    return {"message": f"Policy {policy_num} deleted successfully"}

@router.post("/policies/{id}/send-reminder", response_model=PolicyResponse)
def send_policy_reminder(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.AGENT, UserRole.ADMIN]))
):
    policy = db.query(Policy).filter(Policy.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    customer = policy.customer
    if not customer:
        raise HTTPException(status_code=400, detail="Policy has no assigned customer profile")

    end_date_str = policy.end_date.strftime("%d %b %Y") if policy.end_date else "N/A"
    cust_name = customer.full_name.split("(")[0].strip() if customer.full_name else "Valued Customer"

    # Send SMTP HTML Email
    send_policy_reminder_email(
        to_email=customer.email,
        customer_name=cust_name,
        policy_number=policy.policy_number,
        title=policy.title,
        coverage_amount=policy.coverage_amount,
        premium=policy.premium,
        end_date_str=end_date_str
    )

    # Update timestamp
    policy.last_reminder_sent = datetime.now()
    db.commit()
    db.refresh(policy)

    # In-App Notification
    create_notification(
        db=db,
        user_id=customer.id,
        title="Policy Renewal Notice",
        message=f"Renewal notice sent for policy {policy.policy_number} ({policy.title}). Please complete renewal before {end_date_str}.",
        notification_type="POLICY"
    )

    return policy

