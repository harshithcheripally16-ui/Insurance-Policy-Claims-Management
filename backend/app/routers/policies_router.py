import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import User, Policy, PolicyCatalog, PolicyStatus, PolicyCategory, UserRole
from app.schemas import (
    PolicyOut, PolicyCatalogOut, PolicyCatalogCreate, PolicyCreate, IssuePolicyRequest, PolicyStatusUpdate, PolicyUpdate
)
from app.dependencies import get_current_user, require_roles
from app.services.smtp_service import send_renewal_reminder_email
from app.services.sms_service import send_sms_reminder
from app.services.notification import create_notification

router = APIRouter(prefix="/api/policies", tags=["Policies"])

# Catalog Endpoints
@router.get("/catalog", response_model=List[PolicyCatalogOut])
def get_policy_catalog(
    category: Optional[PolicyCategory] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(PolicyCatalog)
    if category:
        q = q.filter(PolicyCatalog.category == category)
    if query:
        search = f"%{query}%"
        q = q.filter(or_(PolicyCatalog.title.ilike(search), PolicyCatalog.description.ilike(search)))
    return q.all()

@router.post("/catalog", response_model=PolicyCatalogOut)
def create_catalog_item(
    item_in: PolicyCatalogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    new_item = PolicyCatalog(**item_in.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# Customer Policy Endpoints with Multi-Filter Bar
@router.get("", response_model=List[PolicyOut])
def get_policies(
    query: Optional[str] = None,
    category: Optional[PolicyCategory] = None,
    policy_status: Optional[PolicyStatus] = Query(None, alias="status"),
    valid_from: Optional[str] = None,
    valid_until: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Policy)
    
    # If customer, filter to only their own policies
    if current_user.role == UserRole.CUSTOMER:
        q = q.filter(Policy.customer_id == current_user.id)

    # Advanced Multi-Filter Bar filters
    if query:
        search_str = f"%{query}%"
        # Join with User for customer name matching
        q = q.join(User, Policy.customer_id == User.id).filter(
            or_(
                Policy.policy_number.ilike(search_str),
                Policy.title.ilike(search_str),
                User.name.ilike(search_str)
            )
        )

    if category:
        q = q.filter(Policy.category == category)

    if policy_status:
        q = q.filter(Policy.status == policy_status)

    if valid_from:
        try:
            from_dt = datetime.datetime.fromisoformat(valid_from)
            q = q.filter(Policy.valid_from >= from_dt)
        except ValueError:
            pass

    if valid_until:
        try:
            until_dt = datetime.datetime.fromisoformat(valid_until)
            q = q.filter(Policy.valid_until <= until_dt)
        except ValueError:
            pass

    policies = q.order_by(Policy.id.asc()).all()

    # Enrich output with Customer & Agent Full Names
    out_list = []
    for p in policies:
        p_dict = PolicyOut.model_validate(p)
        if p.customer:
            p_dict.customer_name = p.customer.name
        if p.agent:
            p_dict.agent_name = p.agent.name
        out_list.append(p_dict)

    return out_list

@router.post("/issue", response_model=PolicyOut)
def issue_policy(
    req: IssuePolicyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    catalog = db.query(PolicyCatalog).filter(PolicyCatalog.id == req.catalog_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog plan not found")

    customer = db.query(User).filter(User.id == req.customer_id, User.role == UserRole.CUSTOMER).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer account not found")

    random_num = random.randint(100000, 999999)
    policy_number = f"POL-{catalog.category.value[:3].upper()}-{random_num}"
    
    valid_from = datetime.datetime.utcnow()
    valid_until = valid_from + datetime.timedelta(days=365 * req.tenure_years)

    new_policy = Policy(
        policy_number=policy_number,
        customer_id=customer.id,
        agent_id=current_user.id,
        catalog_id=catalog.id,
        title=catalog.title,
        category=catalog.category,
        premium_amount=catalog.base_premium * req.tenure_years,
        coverage_amount=catalog.coverage_amount,
        status=PolicyStatus.ACTIVE,
        valid_from=valid_from,
        valid_until=valid_until
    )

    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)

    # Send in-app notification to customer
    create_notification(
        db,
        user_id=customer.id,
        title="New Policy Coverage Issued",
        message=f"Your policy {new_policy.title} (#{new_policy.policy_number}) has been issued by Agent {current_user.name}."
    )

    p_dict = PolicyOut.model_validate(new_policy)
    p_dict.customer_name = customer.name
    p_dict.agent_name = current_user.name
    return p_dict

@router.put("/{policy_id}/status", response_model=PolicyOut)
def update_policy_status(
    policy_id: int,
    status_in: PolicyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    policy.status = status_in.status
    db.commit()
    db.refresh(policy)

    p_dict = PolicyOut.model_validate(policy)
    if policy.customer:
        p_dict.customer_name = policy.customer.name
    if policy.agent:
        p_dict.agent_name = policy.agent.name
    return p_dict

@router.put("/{policy_id}", response_model=PolicyOut)
def update_policy(
    policy_id: int,
    policy_in: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    update_data = policy_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)

    db.commit()
    db.refresh(policy)

    p_dict = PolicyOut.model_validate(policy)
    if policy.customer:
        p_dict.customer_name = policy.customer.name
    if policy.agent:
        p_dict.agent_name = policy.agent.name
    return p_dict

@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    db.delete(policy)
    db.commit()
    return None

@router.post("/{policy_id}/send-email-reminder")
def send_email_reminder(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    customer = policy.customer
    if not customer:
        raise HTTPException(status_code=404, detail="Customer record missing")

    formatted_date = policy.valid_until.strftime("%d %b %Y")
    send_renewal_reminder_email(
        to_email=customer.email,
        customer_name=customer.name,
        policy_number=policy.policy_number,
        policy_title=policy.title,
        valid_until=formatted_date,
        premium_amount=policy.premium_amount
    )

    now = datetime.datetime.utcnow()
    policy.last_reminder_sent = now
    db.commit()

    # In-app notification
    create_notification(
        db,
        user_id=customer.id,
        title="Policy Renewal Notice (Email Sent)",
        message=f"Renewal reminder sent via Email for Policy #{policy.policy_number}.",
        channel="EMAIL"
    )

    return {
        "message": f"Email reminder sent to {customer.email}",
        "last_reminder_sent": now.isoformat()
    }

@router.post("/{policy_id}/send-sms-reminder")
def send_sms_reminder_endpoint(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    customer = policy.customer
    if not customer:
        raise HTTPException(status_code=404, detail="Customer record missing")

    phone_num = customer.phone or "+91 98765 43210"
    formatted_date = policy.valid_until.strftime("%d %b %Y")
    
    send_sms_reminder(
        phone=phone_num,
        customer_name=customer.name,
        policy_number=policy.policy_number,
        valid_until=formatted_date
    )

    now = datetime.datetime.utcnow()
    policy.last_reminder_sent = now
    db.commit()

    # In-app notification
    create_notification(
        db,
        user_id=customer.id,
        title="Policy Renewal Notice (SMS Sent)",
        message=f"Renewal reminder sent via SMS to {phone_num} for Policy #{policy.policy_number}.",
        channel="SMS"
    )

    return {
        "message": f"SMS reminder sent to {phone_num}",
        "last_reminder_sent": now.isoformat()
    }
