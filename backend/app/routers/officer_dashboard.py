from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, UserRole, Claim, ClaimStatus, ClaimReview, Document
from app.schemas import OfficerDashboardResponse, ClaimsByStatusStat, OfficerClaimOut
from app.dependencies import require_roles

router = APIRouter(prefix="/api/officer/dashboard", tags=["Officer Dashboard"])

@router.get("", response_model=OfficerDashboardResponse)
def get_officer_dashboard(
    db: Session = Depends(get_db),
    officer: User = Depends(require_roles(UserRole.CLAIMS_OFFICER, UserRole.ADMIN))
):
    oid = officer.id

    # Claim metrics
    total_claims = db.query(Claim).count()
    submitted_claims = db.query(Claim).filter(Claim.status == ClaimStatus.FILED).count()
    under_review_claims = db.query(Claim).filter(Claim.status == ClaimStatus.UNDER_REVIEW).count()
    approved_claims = db.query(Claim).filter(Claim.status == ClaimStatus.APPROVED).count()
    rejected_claims = db.query(Claim).filter(Claim.status == ClaimStatus.REJECTED).count()

    # My reviews count
    my_reviews_count = db.query(ClaimReview).filter(ClaimReview.officer_id == oid).count()
    pending_review_claims = db.query(Claim).filter(
        Claim.status.in_([ClaimStatus.FILED, ClaimStatus.UNDER_REVIEW])
    ).count()

    # Claims by status for chart
    claims_by_status_raw = db.query(
        Claim.status,
        func.count(Claim.id).label("count"),
        func.coalesce(func.sum(Claim.amount_claimed), 0.0).label("total_amount")
    ).group_by(Claim.status).all()

    claims_status_map = {row[0].value if hasattr(row[0], 'value') else str(row[0]): (row[1], float(row[2])) for row in claims_by_status_raw}
    standard_statuses = ["FILED", "UNDER_REVIEW", "APPROVED", "REJECTED"]
    claims_by_status = [
        ClaimsByStatusStat(
            status=st if st != "FILED" else "SUBMITTED",
            count=claims_status_map.get(st, (0, 0.0))[0],
            total_amount=claims_status_map.get(st, (0, 0.0))[1]
        )
        for st in standard_statuses
    ]

    recent_claims_raw = db.query(Claim).order_by(Claim.id.asc()).limit(10).all()
    recent_claims = []
    for c in recent_claims_raw:
        docs_count = db.query(Document).filter(Document.claim_id == c.id).count()
        reviews_count = db.query(ClaimReview).filter(ClaimReview.claim_id == c.id).count()
        pol = c.policy
        cat_str = pol.category.value if pol and hasattr(pol.category, 'value') else "N/A"
        st_str = c.status.value.upper() if hasattr(c.status, 'value') else str(c.status).upper()
        recent_claims.append(OfficerClaimOut(
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
        ))

    return OfficerDashboardResponse(
        officer_name=officer.name,
        total_claims=total_claims,
        submitted_claims=submitted_claims,
        under_review_claims=under_review_claims,
        approved_claims=approved_claims,
        rejected_claims=rejected_claims,
        my_reviews_count=my_reviews_count,
        pending_review_claims=pending_review_claims,
        claims_by_status=claims_by_status,
        recent_claims=recent_claims
    )
