from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, PolicyPurchase
from app.dependencies import require_agent
from app.dependencies import get_password_hash as hash_password

router = APIRouter(prefix="/api/agent/profile", tags=["Agent Profile"])


@router.get("")
def get_agent_profile(
    current_agent: User = Depends(require_agent)
):
    purchases_count = db.query(PolicyPurchase).filter(PolicyPurchase.agent_id == current_agent.id).count() if hasattr(current_agent, 'agent_purchases') else len(current_agent.agent_purchases)
    return {
        "id": current_agent.id,
        "full_name": current_agent.full_name,
        "email": current_agent.email,
        "phone": current_agent.phone,
        "role": current_agent.role,
        "is_active": current_agent.is_active,
        "created_at": current_agent.created_at,
        "purchases_count": purchases_count,
    }


@router.put("")
def update_agent_profile(
    payload: dict,
    db: Session = Depends(get_db),
    current_agent: User = Depends(require_agent)
):
    user = db.query(User).filter(User.id == current_agent.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.get("full_name") and payload["full_name"].strip():
        user.full_name = payload["full_name"].strip()

    if payload.get("phone") is not None:
        user.phone = payload["phone"].strip() if payload["phone"].strip() else None

    if payload.get("password") and len(payload["password"]) >= 6:
        user.password_hash = hash_password(payload["password"])

    db.commit()
    db.refresh(user)

    purchases_count = len(user.agent_purchases) if user.agent_purchases else 0
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "purchases_count": purchases_count,
    }
