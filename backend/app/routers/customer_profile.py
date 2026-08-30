from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import CustomerProfileOut, CustomerProfileUpdate
from app.dependencies import require_customer, log_audit_action
from app.dependencies import get_password_hash as hash_password

router = APIRouter(prefix="/api/customer/profile", tags=["Customer Profile"])

@router.get("", response_model=CustomerProfileOut)
def get_customer_profile(
    current_customer: User = Depends(require_customer)
):
    return CustomerProfileOut.model_validate(current_customer)

@router.put("", response_model=CustomerProfileOut)
def update_customer_profile(
    payload: CustomerProfileUpdate,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_customer)
):
    user = db.query(User).filter(User.id == current_customer.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.full_name is not None and payload.full_name.strip():
        user.full_name = payload.full_name.strip()
    
    if payload.phone is not None:
        user.phone = payload.phone.strip() if payload.phone.strip() else None

    if payload.password and len(payload.password) >= 6:
        user.password_hash = hash_password(payload.password)

    db.commit()
    db.refresh(user)

    log_audit_action(
        db=db,
        admin_id=None,
        action="PROFILE_UPDATED",
        target_type="USER",
        target_id=str(user.id),
        details=f"Customer {user.email} updated profile information."
    )

    return CustomerProfileOut.model_validate(user)
