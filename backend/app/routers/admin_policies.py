from typing import Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import PolicyCatalog, Policy, User, UserRole, PolicyCategory
from app.schemas import (
    PolicyCatalogCreate,
    PolicyCatalogUpdate,
    PolicyCatalogStatusUpdate,
    PolicyOut,
    PolicyListResponse,
    GenericMessageResponse
)
from app.dependencies import require_roles, log_audit_action

router = APIRouter(prefix="/api/admin/policies", tags=["Admin Policies"])

def map_category_string(type_str: Optional[str]) -> PolicyCategory:
    if not type_str:
        return PolicyCategory.Health
    t_upper = str(type_str).upper()
    if "HEALTH" in t_upper or "HOSPITAL" in t_upper:
        return PolicyCategory.Health
    if "AUTO" in t_upper or "VEHICLE" in t_upper or "MOTOR" in t_upper or "CAR" in t_upper:
        return PolicyCategory.Auto
    if "LIFE" in t_upper:
        return PolicyCategory.Life
    if "HOME" in t_upper or "PROPERTY" in t_upper or "HOUSE" in t_upper or "TRAVEL" in t_upper:
        return PolicyCategory.Home
    return PolicyCategory.Health

def format_policy_catalog_out(p: PolicyCatalog, db: Session) -> PolicyOut:
    purchases_count = db.query(Policy).filter(Policy.catalog_id == p.id).count()
    cat_str = p.category.value.upper() if hasattr(p.category, 'value') else str(p.category).upper()
    is_act = getattr(p, 'is_active', True)
    status_str = "ACTIVE" if is_act else "INACTIVE"
    return PolicyOut(
        id=p.id,
        policy_number=f"CAT-{p.id:03d}",
        name=p.title,
        title=p.title,
        type=cat_str,
        category=p.category,
        description=p.description or "",
        premium=float(p.base_premium),
        premium_amount=float(p.base_premium),
        coverage_amount=float(p.coverage_amount or p.base_premium * 100),
        duration_months=12,
        status=status_str,
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
        matched_cat = map_category_string(type)
        query = query.filter(PolicyCatalog.category == matched_cat)

    if status:
        is_act = (status.upper() == "ACTIVE")
        query = query.filter(PolicyCatalog.is_active == is_act)

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
    payload: PolicyCatalogCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    prem_val = payload.premium if payload.premium is not None else (payload.base_premium if payload.base_premium is not None else payload.premium_amount)
    if prem_val is None or float(prem_val) <= 0:
        raise HTTPException(status_code=422, detail="Base premium must be greater than zero")

    title_val = payload.name or payload.title
    if not title_val or not title_val.strip():
        raise HTTPException(status_code=422, detail="Policy plan name is required")

    matched_cat = map_category_string(payload.type or (payload.category.value if hasattr(payload.category, 'value') else str(payload.category) if payload.category else ""))
    cov_amt = float(payload.coverage_amount) if payload.coverage_amount else float(prem_val) * 100
    
    is_act = True
    if payload.status is not None:
        is_act = (payload.status.upper() == "ACTIVE")

    new_catalog = PolicyCatalog(
        title=title_val.strip(),
        category=matched_cat,
        description=payload.description.strip() if payload.description else "",
        base_premium=float(prem_val),
        coverage_amount=cov_amt,
        features=payload.features or "Cashless Network, 24/7 Claim Support",
        is_active=is_act
    )
    db.add(new_catalog)
    db.commit()
    db.refresh(new_catalog)

    log_audit_action(
        db=db,
        admin_id=admin.id,
        action="POLICY_CATALOG_CREATED",
        target_type="POLICY_CATALOG",
        target_id=str(new_catalog.id),
        details=f"Admin {admin.name} created policy plan '{new_catalog.title}' (₹{new_catalog.base_premium})"
    )

    return format_policy_catalog_out(new_catalog, db)

@router.put("/{id}", response_model=PolicyOut)
def update_policy(
    id: int,
    payload: PolicyCatalogUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy plan not found")

    title_val = payload.name or payload.title
    if title_val and title_val.strip():
        policy.title = title_val.strip()

    if payload.description is not None:
        policy.description = payload.description.strip()

    prem_val = payload.premium if payload.premium is not None else (payload.base_premium if payload.base_premium is not None else payload.premium_amount)
    if prem_val is not None and float(prem_val) > 0:
        policy.base_premium = float(prem_val)
        if not policy.coverage_amount or policy.coverage_amount <= 0:
            policy.coverage_amount = float(prem_val) * 100

    if payload.coverage_amount is not None:
        policy.coverage_amount = float(payload.coverage_amount)

    if payload.type or payload.category:
        type_str = payload.type or (payload.category.value if hasattr(payload.category, 'value') else str(payload.category) if payload.category else None)
        policy.category = map_category_string(type_str)

    if payload.status is not None:
        policy.is_active = (payload.status.upper() == "ACTIVE")

    db.commit()
    db.refresh(policy)

    log_audit_action(
        db=db,
        admin_id=admin.id,
        action="POLICY_CATALOG_UPDATED",
        target_type="POLICY_CATALOG",
        target_id=str(policy.id),
        details=f"Admin {admin.name} updated policy plan '{policy.title}' details."
    )

    return format_policy_catalog_out(policy, db)

@router.patch("/{id}/status", response_model=PolicyOut)
def update_policy_status(
    id: int,
    payload: PolicyCatalogStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy catalog plan not found")

    if payload.status is not None:
        policy.is_active = (payload.status.upper() == "ACTIVE")
    elif payload.is_active is not None:
        policy.is_active = payload.is_active

    db.commit()
    db.refresh(policy)

    status_str = "ACTIVE" if policy.is_active else "INACTIVE"
    log_audit_action(
        db=db,
        admin_id=admin.id,
        action="POLICY_CATALOG_STATUS_CHANGED",
        target_type="POLICY_CATALOG",
        target_id=str(policy.id),
        details=f"Admin {admin.name} toggled policy plan '{policy.title}' status to {status_str}."
    )

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
    # Unlink any policy purchases referencing this catalog ID to prevent FK errors
    db.query(Policy).filter(Policy.catalog_id == id).update({"catalog_id": None})
    db.delete(policy)
    db.commit()

    log_audit_action(
        db=db,
        admin_id=admin.id,
        action="POLICY_CATALOG_DELETED",
        target_type="POLICY_CATALOG",
        target_id=str(id),
        details=f"Admin {admin.name} permanently deleted policy plan '{pol_title}'."
    )

    return GenericMessageResponse(message=f"Policy plan '{pol_title}' deleted successfully")

