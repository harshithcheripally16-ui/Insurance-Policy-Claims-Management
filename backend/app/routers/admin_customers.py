from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, UserRole, Policy, Claim
from app.schemas import CustomerDetailOut, CustomerListResponse
from app.dependencies import require_roles

router = APIRouter(prefix="/api/admin/customers", tags=["Admin Customers"])

def format_customer_detail(c: User, db: Session, include_relations: bool = False) -> CustomerDetailOut:
    purchases = db.query(Policy).filter(Policy.customer_id == c.id).all()
    claims = db.query(Claim).filter(Claim.customer_id == c.id).all()

    policies_list = []
    if include_relations:
        for pur in purchases:
            cat_str = pur.category.value if hasattr(pur.category, 'value') else str(pur.category)
            st_str = pur.status.value if hasattr(pur.status, 'value') else str(pur.status)
            policies_list.append({
                "purchase_id": pur.id,
                "policy_id": pur.id,
                "policy_number": pur.policy_number,
                "policy_name": pur.title,
                "type": cat_str,
                "premium": pur.premium_amount,
                "start_date": pur.valid_from,
                "end_date": pur.valid_until,
                "status": st_str,
                "agent_name": pur.agent.name if pur.agent else "Direct Purchase"
            })

    claims_list = []
    if include_relations:
        for clm in claims:
            st_str = clm.status.value if hasattr(clm.status, 'value') else str(clm.status)
            claims_list.append({
                "claim_id": clm.id,
                "claim_number": clm.claim_number,
                "reason": clm.description,
                "amount": clm.amount_claimed,
                "claim_date": clm.filed_at,
                "status": st_str
            })

    role_str = c.role.value if hasattr(c.role, 'value') else str(c.role)
    return CustomerDetailOut(
        id=c.id,
        full_name=c.name,
        email=c.email,
        phone=c.phone,
        role=role_str,
        is_active=getattr(c, 'is_active', True),
        created_at=c.created_at,
        policies_count=len(purchases),
        claims_count=len(claims),
        policies=policies_list,
        claims=claims_list
    )

@router.get("", response_model=CustomerListResponse)
def list_customers(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    query = db.query(User).filter(User.role == UserRole.CUSTOMER)

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term)
            )
        )

    total = query.count()
    customers = query.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_customer_detail(c, db, include_relations=False) for c in customers]

    return CustomerListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=CustomerDetailOut)
def get_customer_details(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    customer = db.query(User).filter(User.id == id, User.role == UserRole.CUSTOMER).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return format_customer_detail(customer, db, include_relations=True)
