from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, UserRole, ClaimReview
from app.schemas import (
    OfficerCreate,
    OfficerUpdate,
    UserStatusUpdate,
    OfficerDetailOut,
    OfficerListResponse,
    GenericMessageResponse
)
from app.dependencies import require_roles, get_password_hash

router = APIRouter(prefix="/api/admin/claims-officers", tags=["Admin Claims Officers"])

def format_officer_detail(officer: User, db: Session) -> OfficerDetailOut:
    reviews = db.query(ClaimReview).filter(ClaimReview.officer_id == officer.id).all()
    approved = sum(1 for r in reviews if (r.decision.value if hasattr(r.decision, 'value') else str(r.decision)) == "APPROVED")
    rejected = sum(1 for r in reviews if (r.decision.value if hasattr(r.decision, 'value') else str(r.decision)) == "REJECTED")

    role_str = officer.role.value if hasattr(officer.role, 'value') else str(officer.role)

    return OfficerDetailOut(
        id=officer.id,
        full_name=officer.name,
        email=officer.email,
        phone=officer.phone,
        role=role_str,
        is_active=getattr(officer, 'is_active', True),
        created_at=officer.created_at,
        reviews_count=len(reviews),
        approved_count=approved,
        rejected_count=rejected
    )

@router.get("", response_model=OfficerListResponse)
def list_claims_officers(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    query = db.query(User).filter(User.role == UserRole.CLAIMS_OFFICER)

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
    officers = query.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_officer_detail(o, db) for o in officers]

    return OfficerListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=OfficerDetailOut)
def get_claims_officer_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    officer = db.query(User).filter(User.id == id, User.role == UserRole.CLAIMS_OFFICER).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Claims Officer not found")
    return format_officer_detail(officer, db)

@router.post("", response_model=OfficerDetailOut, status_code=status.HTTP_201_CREATED)
def create_claims_officer(
    payload: OfficerCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )
    
    new_officer = User(
        name=payload.full_name.strip(),
        email=payload.email.lower().strip(),
        phone=payload.phone.strip() if payload.phone else None,
        hashed_password=get_password_hash(payload.password),
        role=UserRole.CLAIMS_OFFICER,
        is_active=payload.is_active
    )
    db.add(new_officer)
    db.commit()
    db.refresh(new_officer)

    return format_officer_detail(new_officer, db)

@router.put("/{id}", response_model=OfficerDetailOut)
def update_claims_officer(
    id: int,
    payload: OfficerUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    officer = db.query(User).filter(User.id == id, User.role == UserRole.CLAIMS_OFFICER).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Claims Officer not found")

    if payload.email and payload.email.lower().strip() != officer.email:
        existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
        if existing and existing.id != officer.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already taken"
            )
        officer.email = payload.email.lower().strip()

    if payload.full_name is not None:
        officer.name = payload.full_name.strip()
    if payload.phone is not None:
        officer.phone = payload.phone.strip() if payload.phone else None
    if payload.password:
        officer.hashed_password = get_password_hash(payload.password)

    db.commit()
    db.refresh(officer)

    return format_officer_detail(officer, db)

@router.patch("/{id}/status", response_model=OfficerDetailOut)
def update_claims_officer_status(
    id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    officer = db.query(User).filter(User.id == id, User.role == UserRole.CLAIMS_OFFICER).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Claims Officer not found")

    officer.is_active = payload.is_active
    db.commit()
    db.refresh(officer)

    return format_officer_detail(officer, db)

@router.delete("/{id}", response_model=GenericMessageResponse)
def delete_claims_officer(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    officer = db.query(User).filter(User.id == id, User.role == UserRole.CLAIMS_OFFICER).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Claims Officer not found")

    officer_email = officer.email
    db.delete(officer)
    db.commit()

    return GenericMessageResponse(message=f"Claims Officer {officer_email} deleted successfully")
