from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import PolicyCatalog, Policy, User, UserRole, PolicyCategory
from app.schemas import (
    PolicyCreate,
    PolicyUpdate,
    PolicyStatusUpdate,
    PolicyOut,
    PolicyListResponse,
    GenericMessageResponse
)
from app.dependencies import require_roles, log_audit_action

router = APIRouter(prefix="/api/admin/policies", tags=["Admin Policies"])

def format_policy_catalog_out(p: PolicyCatalog, db: Session) -> PolicyOut:
    purchases_count = db.query(Policy).filter(Policy.catalog_id == p.id).count()
    cat_str = p.category.value.upper() if hasattr(p.category, 'value') else str(p.category).upper()
    return PolicyOut(
        id=p.id,
        policy_number=f"CAT-00{p.id}",
        name=p.title,
        type=cat_str,
        description=p.description or "",
        premium=float(p.base_premium),
        duration_months=12,
        status="ACTIVE",
        created_at=p.created_at,
        updated_at=p.created_at,
        purchases_count=purchases_count
    )

@router.get("", response_model=PolicyListResponse)
def list_policies(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    query = db.query(PolicyCatalog)

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PolicyCatalog.title.ilike(search_term),
                PolicyCatalog.description.ilike(search_term)
            )
        )

    if type:
        # Match category enum
        for cat in PolicyCategory:
            if cat.value.upper() == type.upper() or cat.name.upper() == type.upper():
                query = query.filter(PolicyCatalog.category == cat)
                break

    total = query.count()
    policies = query.order_by(PolicyCatalog.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_policy_catalog_out(p, db) for p in policies]

    return PolicyListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=PolicyOut)
def get_policy_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy catalog plan not found")
    return format_policy_catalog_out(policy, db)

@router.post("", response_model=PolicyOut, status_code=status.HTTP_201_CREATED)
def create_policy(
    payload: PolicyCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    if payload.premium <= 0:
        raise HTTPException(status_code=422, detail="Base premium must be greater than zero")

    # Map type string to category enum
    matched_cat = PolicyCategory.Health
    for cat in PolicyCategory:
        if cat.value.upper() == payload.type.upper() or cat.name.upper() == payload.type.upper():
            matched_cat = cat
            break

    new_catalog = PolicyCatalog(
        title=payload.name.strip(),
        category=matched_cat,
        description=payload.description.strip() if payload.description else "",
        base_premium=float(payload.premium),
        coverage_amount=float(payload.premium) * 100, # default 100x coverage
        features="Cashless Network, 24/7 Claim Support"
    )
    db.add(new_catalog)
    db.commit()
    db.refresh(new_catalog)

    return format_policy_catalog_out(new_catalog, db)

@router.put("/{id}", response_model=PolicyOut)
def update_policy(
    id: int,
    payload: PolicyUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if payload.name is not None:
        policy.title = payload.name.strip()
    if payload.description is not None:
        policy.description = payload.description.strip()
    if payload.premium is not None:
        policy.base_premium = float(payload.premium)
    if payload.type is not None:
        for cat in PolicyCategory:
            if cat.value.upper() == payload.type.upper() or cat.name.upper() == payload.type.upper():
                policy.category = cat
                break

    db.commit()
    db.refresh(policy)
    return format_policy_catalog_out(policy, db)

@router.patch("/{id}/status", response_model=PolicyOut)
def update_policy_status(
    id: int,
    payload: PolicyStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy catalog plan not found")
    return format_policy_catalog_out(policy, db)

@router.delete("/{id}", response_model=GenericMessageResponse)
def delete_policy(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy catalog plan not found")

    pol_title = policy.title
    db.delete(policy)
    db.commit()

    return GenericMessageResponse(message=f"Policy plan '{pol_title}' deleted successfully")
