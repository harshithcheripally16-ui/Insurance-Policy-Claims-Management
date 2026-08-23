from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import User, UserRole, Policy
from app.schemas import CustomerOut, UserOut, UserCreate
from app.dependencies import get_current_user, require_roles, get_password_hash

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/customers", response_model=List[CustomerOut])
def get_customers(
    query: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    q = db.query(User).filter(User.role == UserRole.CUSTOMER)

    if query:
        search = f"%{query}%"
        q = q.filter(or_(User.name.ilike(search), User.email.ilike(search), User.phone.ilike(search)))

    customers = q.order_by(User.id.asc()).all()

    # Reindex sequentially 1, 2, 3... with zero gaps
    result = []
    for idx, cust in enumerate(customers, start=1):
        total_policies = db.query(Policy).filter(Policy.customer_id == cust.id).count()
        cust_out = CustomerOut(
            id=cust.id,
            display_id=idx,
            name=cust.name,
            email=cust.email,
            phone=cust.phone,
            total_policies=total_policies,
            created_at=cust.created_at
        )
        result.append(cust_out)

    return result

@router.post("/customers", response_model=UserOut)
def create_customer(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer email already exists")

    hashed = get_password_hash(user_in.password or "Password@123")
    new_cust = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone or "+91 98765 43210",
        hashed_password=hashed,
        role=UserRole.CUSTOMER
    )
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
