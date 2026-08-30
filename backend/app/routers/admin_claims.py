from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Claim, User, Policy, Document, ClaimReview, UserRole
from app.schemas import (
    ClaimDetailOut,
    ClaimListResponse,
    PurchaseCustomerOut,
    PurchaseDetailOut,
    PurchasePolicyOut,
    PurchaseAgentOut,
    DocumentOut,
    ClaimReviewOut,
    UserOut
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/admin/claims", tags=["Admin Claims"])

def format_claim_detail(c: Claim, db: Session, include_relations: bool = True) -> ClaimDetailOut:
    customer_data = None
    if c.customer:
        customer_data = PurchaseCustomerOut(
            id=c.customer.id,
            full_name=c.customer.name,
            email=c.customer.email,
            phone=c.customer.phone
        )

    purchase_data = None
    if c.policy:
        p = c.policy
        cat_str = p.category.value.upper() if hasattr(p.category, 'value') else str(p.category).upper()
        pol_out = PurchasePolicyOut(
            id=p.id,
            policy_number=p.policy_number,
            name=p.title,
            type=cat_str,
            premium=p.premium_amount,
            duration_months=12
        )

        agent_out = PurchaseAgentOut(
            id=p.agent.id,
            full_name=p.agent.name,
            email=p.agent.email
        ) if p.agent else None

        status_str = p.status.value.upper() if hasattr(p.status, 'value') else str(p.status).upper()
        purchase_data = PurchaseDetailOut(
            id=p.id,
            policy_id=p.id,
            customer_id=p.customer_id,
            agent_id=p.agent_id,
            start_date=p.valid_from,
            end_date=p.valid_until,
            status=status_str,
            created_at=p.created_at,
            customer=customer_data,
            policy=pol_out,
            agent=agent_out,
            claims_count=1
        )

    docs_out = []
    reviews_out = []
    if include_relations:
        docs = db.query(Document).filter(Document.claim_id == c.id).all()
        docs_out = [DocumentOut.model_validate(d) for d in docs]

        reviews = db.query(ClaimReview).filter(ClaimReview.claim_id == c.id).order_by(ClaimReview.id.asc()).all()
        for rev in reviews:
            officer_out = None
            if rev.officer:
                officer_out = UserOut(
                    id=rev.officer.id,
                    full_name=rev.officer.name,
                    email=rev.officer.email,
                    phone=rev.officer.phone,
                    role=rev.officer.role,
                    is_active=True,
                    created_at=rev.officer.created_at,
                    updated_at=rev.officer.created_at
                )
            dec_str = rev.decision.value if hasattr(rev.decision, 'value') else str(rev.decision)
            reviews_out.append(ClaimReviewOut(
                id=rev.id,
                claim_id=rev.claim_id,
                officer_id=rev.officer_id,
                decision=dec_str,
                remarks=rev.remarks,
                review_date=rev.review_date,
                officer=officer_out
            ))

    st_str = c.status.value.upper() if hasattr(c.status, 'value') else str(c.status).upper()
    return ClaimDetailOut(
        id=c.id,
        claim_number=c.claim_number,
        policy_purchase_id=c.policy_id,
        customer_id=c.customer_id,
        reason=c.description,
        amount=c.amount_claimed,
        claim_date=c.filed_at,
        status=st_str,
        created_at=c.filed_at,
        updated_at=c.filed_at,
        customer=customer_data,
        policy_purchase=purchase_data,
        documents=docs_out,
        reviews=reviews_out
    )

@router.get("", response_model=ClaimListResponse)
def list_claims(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
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

    items = [format_claim_detail(c, db, include_relations=True) for c in claims]

    return ClaimListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=ClaimDetailOut)
def get_claim_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return format_claim_detail(claim, db, include_relations=True)
