from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserResponse, UserCreate, UserProfileUpdate
from app.auth import get_password_hash
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.put("/me", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the logged-in customer's profile (Full Name, Phone, Address)."""
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.address is not None:
        current_user.address = profile_in.address

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("", response_model=List[UserResponse])
def get_users(
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.AGENT, UserRole.CLAIMS_OFFICER]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.id.desc()).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.AGENT]))
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists")
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or UserRole.CUSTOMER,
        phone=user_in.phone,
        address=user_in.address
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
