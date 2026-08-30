from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ClaimReview
from app.schemas import OfficerProfileOut, OfficerProfileUpdate
from app.dependencies import require_claims_officer
from app.dependencies import get_password_hash as hash_password

router = APIRouter(prefix="/api/officer/profile", tags=["Officer Profile"])


@router.get("", response_model=OfficerProfileOut)
def get_officer_profile(
    current_officer: User = Depends(require_claims_officer)
):
    reviews_count = len(current_officer.reviews_done) if current_officer.reviews_done else 0
    return OfficerProfileOut(
        id=current_officer.id,
        full_name=current_officer.full_name,
        email=current_officer.email,
        phone=current_officer.phone,
        role=current_officer.role,
        is_active=current_officer.is_active,
        created_at=current_officer.created_at,
        reviews_count=reviews_count
    )


@router.put("", response_model=OfficerProfileOut)
def update_officer_profile(
    payload: OfficerProfileUpdate,
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_claims_officer)
):
    user = db.query(User).filter(User.id == current_officer.id).first()
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

    reviews_count = db.query(ClaimReview).filter(ClaimReview.officer_id == user.id).count()
    return OfficerProfileOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        reviews_count=reviews_count
    )
