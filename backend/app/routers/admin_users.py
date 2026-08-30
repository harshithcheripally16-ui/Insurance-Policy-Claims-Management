from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, UserRole, Policy, Claim, ClaimReview
from app.schemas import (
    UserCreate,
    UserUpdate,
    UserStatusUpdate,
    UserDetailOut,
    UserListResponse,
    GenericMessageResponse
)
from app.dependencies import require_roles, get_password_hash

router = APIRouter(prefix="/api/admin/users", tags=["Admin Users"])

def get_user_detail_schema(u: User, db: Session) -> UserDetailOut:
    policies_count = db.query(Policy).filter(Policy.customer_id == u.id).count()
    claims_count = db.query(Claim).filter(Claim.customer_id == u.id).count()
    purchases_handled_count = db.query(Policy).filter(Policy.agent_id == u.id).count()
    reviews_count = db.query(ClaimReview).filter(ClaimReview.officer_id == u.id).count()

    role_str = u.role.value if hasattr(u.role, 'value') else str(u.role)

    return UserDetailOut(
        id=u.id,
        full_name=u.name,
        email=u.email,
        phone=u.phone,
        role=role_str,
        is_active=getattr(u, 'is_active', True),
        created_at=u.created_at,
        updated_at=getattr(u, 'updated_at', u.created_at),
        policies_count=policies_count,
        claims_count=claims_count,
        purchases_handled_count=purchases_handled_count,
        reviews_count=reviews_count
    )

@router.get("", response_model=UserListResponse)
def list_users(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    query = db.query(User)

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term)
            )
        )

    if role:
        for r in UserRole:
            if r.value.upper() == role.upper() or r.name.upper() == role.upper():
                query = query.filter(User.role == r)
                break

    total = query.count()
    users = query.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [get_user_detail_schema(u, db) for u in users]

    return UserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=UserDetailOut)
def get_user_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_detail_schema(user, db)

@router.post("", response_model=UserDetailOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )
    
    matched_role = UserRole.CUSTOMER
    for r in UserRole:
        if r.value.upper() == payload.role.upper() or r.name.upper() == payload.role.upper():
            matched_role = r
            break

    new_user = User(
        name=payload.full_name.strip(),
        email=payload.email.lower().strip(),
        phone=payload.phone.strip() if payload.phone else None,
        hashed_password=get_password_hash(payload.password),
        role=matched_role,
        is_active=payload.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return get_user_detail_schema(new_user, db)

@router.put("/{id}", response_model=UserDetailOut)
def update_user(
    id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_self = (user.id == admin.id or user.email.lower() == admin.email.lower())
    if is_self:
        if payload.role and str(payload.role).upper() not in ["ADMIN", "USERROLE.ADMIN"]:
            raise HTTPException(status_code=400, detail="Administrators cannot change their own role.")
        if payload.is_active is False:
            raise HTTPException(status_code=400, detail="Administrators cannot deactivate their own account.")

    if payload.email and payload.email.lower().strip() != user.email:
        existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already in use by another user"
            )
        user.email = payload.email.lower().strip()

    if payload.full_name is not None:
        user.name = payload.full_name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip() if payload.phone else None
    if payload.role is not None and not is_self:
        for r in UserRole:
            if r.value.upper() == payload.role.upper() or r.name.upper() == payload.role.upper():
                user.role = r
                break
    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    db.commit()
    db.refresh(user)

    return get_user_detail_schema(user, db)

@router.patch("/{id}/status", response_model=UserDetailOut)
def update_user_status(
    id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id or user.email.lower() == admin.email.lower():
        raise HTTPException(status_code=400, detail="Administrators cannot alter their own account status.")

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    return get_user_detail_schema(user, db)

@router.delete("/{id}", response_model=GenericMessageResponse)
def delete_user(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id or user.email.lower() == admin.email.lower():
        raise HTTPException(status_code=400, detail="Administrators cannot delete their own account.")

    user_email = user.email
    db.delete(user)
    db.commit()

    return GenericMessageResponse(message=f"User {user_email} deleted successfully")
