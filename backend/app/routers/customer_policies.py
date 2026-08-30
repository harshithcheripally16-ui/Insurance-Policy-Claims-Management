from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import PolicyCatalog, User, UserRole, PolicyCategory
from app.schemas import PolicyOut, PolicyListResponse
from app.dependencies import require_roles

router = APIRouter(prefix="/api/customer/policies", tags=["Customer Policies"])

def format_catalog_out(p: PolicyCatalog) -> PolicyOut:
    cat_enum = p.category
    cat_str = cat_enum.value.upper() if hasattr(cat_enum, 'value') else str(cat_enum).upper()
    if cat_str == "AUTO":
        cat_str = "VEHICLE"
    return PolicyOut(
        id=p.id,
        policy_id=p.id,
        catalog_id=p.id,
        policy_number=f"CAT-00{p.id}",
        title=p.title,
        name=p.title,
        policy_name=p.title,
        category=cat_enum,
        type=cat_str,
        description=p.description or "",
        premium_amount=float(p.base_premium),
        premium=float(p.base_premium),
        coverage_amount=float(p.coverage_amount),
        duration_months=12,
        status="ACTIVE",
        created_at=p.created_at,
        updated_at=p.created_at,
        purchases_count=0
    )

@router.get("", response_model=PolicyListResponse)
def list_available_policies(
    page: int = 1,
    page_size: int = 12,
    search: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
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
        for cat in PolicyCategory:
            if cat.value.upper() == type.upper() or cat.name.upper() == type.upper():
                query = query.filter(PolicyCatalog.category == cat)
                break

    total = query.count()
    catalogs = query.order_by(PolicyCatalog.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_catalog_out(p) for p in catalogs]

    return PolicyListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=PolicyOut)
def get_policy_details(
    id: int,
    db: Session = Depends(get_db),
    current_customer: User = Depends(require_roles(UserRole.CUSTOMER))
):
    policy = db.query(PolicyCatalog).filter(PolicyCatalog.id == id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Insurance policy plan not found")
    return format_catalog_out(policy)
