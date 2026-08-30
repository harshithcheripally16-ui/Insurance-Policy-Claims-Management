from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, UserRole, Claim, ClaimReview, Document
from app.schemas import (
    OfficerClaimOut,
    OfficerClaimDetailOut,
    OfficerClaimListResponse,
    DocumentOut,
    ClaimReviewOut,
    UserOut
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/officer/claims", tags=["Officer Claims"])

def format_officer_claim_out(c: Claim, db: Session) -> OfficerClaimOut:
    docs_count = db.query(Document).filter(Document.claim_id == c.id).count()
    reviews_count = db.query(ClaimReview).filter(ClaimReview.claim_id == c.id).count()
    pol = c.policy
    cat_str = pol.category.value if pol and hasattr(pol.category, 'value') else "N/A"
    st_str = c.status.value.upper() if hasattr(c.status, 'value') else str(c.status).upper()
    return OfficerClaimOut(
        id=c.id,
        claim_number=c.claim_number,
        policy_purchase_id=c.policy_id,
        policy_name=pol.title if pol else "N/A",
        policy_number=pol.policy_number if pol else "N/A",
        policy_type=cat_str,
        reason=c.description,
        amount=c.amount_claimed,
        claim_date=c.filed_at,
        status=st_str,
        created_at=c.filed_at,
        updated_at=c.filed_at,
        customer_name=c.customer.name if c.customer else "N/A",
        customer_email=c.customer.email if c.customer else "N/A",
        documents_count=docs_count,
        reviews_count=reviews_count
    )

@router.get("", response_model=OfficerClaimListResponse)
def list_claims(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    officer: User = Depends(require_roles(UserRole.CLAIMS_OFFICER, UserRole.ADMIN))
):
    query = db.query(Claim).join(Claim.customer)

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Claim.claim_number.ilike(search_term),
                Claim.description.ilike(search_term),
                User.name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    if status and status.upper() in ["SUBMITTED", "FILED", "UNDER_REVIEW", "APPROVED", "REJECTED"]:
        st = status.upper()
        if st == "SUBMITTED":
            st = "FILED"
        query = query.filter(Claim.status == st)

    total = query.count()
    claims = query.order_by(Claim.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_officer_claim_out(c, db) for c in claims]

    return OfficerClaimListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=OfficerClaimDetailOut)
def get_claim_details(
    id: int,
    db: Session = Depends(get_db),
    officer: User = Depends(require_roles(UserRole.CLAIMS_OFFICER, UserRole.ADMIN))
):
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    docs = db.query(Document).filter(Document.claim_id == claim.id).order_by(Document.id.asc()).all()
    docs_out = [DocumentOut.model_validate(d) for d in docs]

    reviews = db.query(ClaimReview).filter(ClaimReview.claim_id == claim.id).order_by(ClaimReview.id.asc()).all()
    reviews_out = []
    for r in reviews:
        officer_out = None
        if r.officer:
            officer_out = UserOut(
                id=r.officer.id,
                full_name=r.officer.name,
                email=r.officer.email,
                phone=r.officer.phone,
                role=r.officer.role.value if hasattr(r.officer.role, 'value') else str(r.officer.role),
                is_active=True,
                created_at=r.officer.created_at,
                updated_at=r.officer.created_at
            )
        dec_str = r.decision.value if hasattr(r.decision, 'value') else str(r.decision)
        reviews_out.append(ClaimReviewOut(
            id=r.id,
            claim_id=r.claim_id,
            officer_id=r.officer_id,
            decision=dec_str,
            remarks=r.remarks,
            review_date=r.review_date,
            officer=officer_out
        ))

    pol = claim.policy
    cat_str = pol.category.value if pol and hasattr(pol.category, 'value') else "N/A"
    st_str = claim.status.value.upper() if hasattr(claim.status, 'value') else str(claim.status).upper()

    return OfficerClaimDetailOut(
        id=claim.id,
        claim_number=claim.claim_number,
        policy_purchase_id=claim.policy_id,
        reason=claim.description,
        amount=claim.amount_claimed,
        claim_date=claim.filed_at,
        status=st_str,
        created_at=claim.filed_at,
        updated_at=claim.filed_at,
        customer_name=claim.customer.name if claim.customer else "N/A",
        customer_email=claim.customer.email if claim.customer else "N/A",
        customer_phone=claim.customer.phone if claim.customer else None,
        policy_name=pol.title if pol else None,
        policy_number=pol.policy_number if pol else None,
        policy_type=cat_str,
        policy_premium=pol.premium_amount if pol else None,
        policy_duration_months=12,
        policy_start_date=pol.valid_from if pol else None,
        policy_end_date=pol.valid_until if pol else None,
        documents=docs_out,
        reviews=reviews_out
    )
