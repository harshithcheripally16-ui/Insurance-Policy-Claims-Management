from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Claim, ClaimReview
from app.schemas import ClaimReviewCreate, ClaimReviewOut, UserOut, GenericMessageResponse
from app.dependencies import require_claims_officer, create_notification

router = APIRouter(prefix="/api/officer", tags=["Officer Reviews"])


def utc_now():
    return datetime.now(timezone.utc)


@router.post("/claims/{claim_id}/review", response_model=ClaimReviewOut)
def submit_claim_review(
    claim_id: int,
    payload: ClaimReviewCreate,
    db: Session = Depends(get_db),
    officer: User = Depends(require_claims_officer)
):
    # Verify claim exists
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Verify claim is eligible for review (not already approved/rejected)
    if claim.status in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Claim has already been {claim.status.lower()}. No further review possible."
        )

    now = utc_now()

    # Create ClaimReview record
    new_review = ClaimReview(
        claim_id=claim.id,
        officer_id=officer.id,
        decision=payload.decision.upper(),
        remarks=payload.remarks.strip(),
        review_date=now
    )
    db.add(new_review)

    # Update claim status based on decision
    if payload.decision.upper() == "APPROVED":
        claim.status = "APPROVED"
    elif payload.decision.upper() == "REJECTED":
        claim.status = "REJECTED"
    elif payload.decision.upper() == "UNDER_REVIEW":
        claim.status = "UNDER_REVIEW"

    claim.updated_at = now

    db.commit()
    db.refresh(new_review)

    # Notify the customer
    if claim.customer_id:
        if payload.decision.upper() == "APPROVED":
            create_notification(
                db=db,
                user_id=claim.customer_id,
                title="Claim Approved",
                message=f"Claim {claim.claim_number} for ${claim.amount:,.2f} has been approved. Remarks: {payload.remarks.strip()[:100]}",
                notification_type="SUCCESS",
                link=f"/customer/claims/{claim.id}"
            )
        elif payload.decision.upper() == "REJECTED":
            create_notification(
                db=db,
                user_id=claim.customer_id,
                title="Claim Rejected",
                message=f"Claim {claim.claim_number} for ${claim.amount:,.2f} has been rejected. Remarks: {payload.remarks.strip()[:100]}",
                notification_type="ERROR",
                link=f"/customer/claims/{claim.id}"
            )
        elif payload.decision.upper() == "UNDER_REVIEW":
            create_notification(
                db=db,
                user_id=claim.customer_id,
                title="Claim Under Review",
                message=f"Claim {claim.claim_number} is now under review by our claims team.",
                notification_type="INFO",
                link=f"/customer/claims/{claim.id}"
            )

    # Build response
    officer_out = UserOut.model_validate(officer)
    return ClaimReviewOut(
        id=new_review.id,
        claim_id=new_review.claim_id,
        officer_id=new_review.officer_id,
        decision=new_review.decision,
        remarks=new_review.remarks,
        review_date=new_review.review_date,
        officer=officer_out
    )


@router.get("/reviews", response_model=list[ClaimReviewOut])
def get_my_reviews(
    page: int = 1,
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    officer: User = Depends(require_claims_officer)
):
    reviews = db.query(ClaimReview).filter(
        ClaimReview.officer_id == officer.id
    ).order_by(ClaimReview.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    reviews_out = []
    for r in reviews:
        officer_out = UserOut.model_validate(r.officer) if r.officer else None
        reviews_out.append(ClaimReviewOut(
            id=r.id,
            claim_id=r.claim_id,
            officer_id=r.officer_id,
            decision=r.decision,
            remarks=r.remarks,
            review_date=r.review_date,
            officer=officer_out
        ))

    return reviews_out
