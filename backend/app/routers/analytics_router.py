import io
import csv
from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, UserRole, Policy, PolicyStatus, Claim, ClaimStatus, Notification
from app.schemas import DashboardAnalyticsResponse, NotificationResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Analytics & Notifications"])

@router.get("/analytics/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_users = db.query(User).count()
    total_policies = db.query(Policy).count()
    active_policies = db.query(Policy).filter(Policy.status == PolicyStatus.ACTIVE).count()
    total_claims = db.query(Claim).count()

    pending_claims = db.query(Claim).filter(Claim.status.in_([ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW])).count()
    approved_claims = db.query(Claim).filter(Claim.status == ClaimStatus.APPROVED).count()
    rejected_claims = db.query(Claim).filter(Claim.status == ClaimStatus.REJECTED).count()

    total_claim_amt = db.query(func.sum(Claim.amount)).filter(Claim.status == ClaimStatus.APPROVED).scalar() or 0.0
    total_premium_amt = db.query(func.sum(Policy.premium)).scalar() or 0.0

    loss_ratio = (total_claim_amt / total_premium_amt * 100) if total_premium_amt > 0 else 0.0

    # Status distribution
    claims_by_status = {
        "Submitted": db.query(Claim).filter(Claim.status == ClaimStatus.SUBMITTED).count(),
        "Under Review": db.query(Claim).filter(Claim.status == ClaimStatus.UNDER_REVIEW).count(),
        "Approved": approved_claims,
        "Rejected": rejected_claims,
        "Docs Required": db.query(Claim).filter(Claim.status == ClaimStatus.DOCUMENTS_REQUIRED).count(),
    }

    # Risk level distribution
    risk_dist = {
        "LOW": db.query(Claim).filter(Claim.risk_level == "LOW").count(),
        "MEDIUM": db.query(Claim).filter(Claim.risk_level == "MEDIUM").count(),
        "HIGH": db.query(Claim).filter(Claim.risk_level == "HIGH").count(),
    }

    return {
        "total_users": total_users,
        "total_policies": total_policies,
        "active_policies": active_policies,
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "total_claim_amount": round(total_claim_amt, 2),
        "total_premium_collected": round(total_premium_amt, 2),
        "loss_ratio": round(loss_ratio, 2),
        "claims_by_status": claims_by_status,
        "risk_level_distribution": risk_dist
    }

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.id.desc()).limit(20).all()

@router.patch("/notifications/mark-read")
@router.patch("/notifications/read-all")
def mark_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.get("/reports/export")
def export_claims_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Claim Number", "Policy Number", "Customer Name", "Reason",
        "Amount (₹)", "Status", "Risk Level", "Risk Score", "Submitted Date"
    ])


    claims = db.query(Claim).order_by(Claim.id.desc()).all()
    for c in claims:
        writer.writerow([
            c.claim_number,
            c.policy.policy_number if c.policy else "N/A",
            c.customer.full_name if c.customer else "N/A",
            c.reason,
            f"{c.amount:.2f}",
            c.status.value,
            c.risk_level,
            c.risk_score,
            c.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=insurance_claims_report.csv"}
    )
