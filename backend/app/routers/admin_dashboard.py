from datetime import datetime
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, UserRole, PolicyCatalog, Policy, PolicyStatus, Claim, ClaimStatus, PolicyCategory
from app.schemas import (
    DashboardStatsResponse,
    ClaimsByStatusStat,
    PoliciesByTypeStat,
    MonthlyClaimsStat,
    PremiumRevenueStat
)
from app.dependencies import require_roles

router = APIRouter(prefix="/api/admin/dashboard", tags=["Admin Dashboard"])

@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    # Total counts
    total_users = db.query(User).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_agents = db.query(User).filter(User.role == UserRole.AGENT).count()
    total_claims_officers = db.query(User).filter(User.role == UserRole.CLAIMS_OFFICER).count()

    total_policies = db.query(PolicyCatalog).count()
    active_policies = db.query(Policy).filter(Policy.status == PolicyStatus.ACTIVE).count()

    total_policy_purchases = db.query(Policy).count()
    expired_policies = db.query(Policy).filter(Policy.status == PolicyStatus.EXPIRED).count()

    total_claims = db.query(Claim).count()
    pending_claims = db.query(Claim).filter(Claim.status.in_([ClaimStatus.FILED, ClaimStatus.UNDER_REVIEW])).count()
    approved_claims = db.query(Claim).filter(Claim.status == ClaimStatus.APPROVED).count()
    rejected_claims = db.query(Claim).filter(Claim.status == ClaimStatus.REJECTED).count()

    # Chart 1: Claims by status
    claims_by_status_raw = db.query(
        Claim.status,
        func.count(Claim.id).label("count"),
        func.coalesce(func.sum(Claim.amount_claimed), 0.0).label("total_amount")
    ).group_by(Claim.status).all()

    claims_status_map = {row[0].value if hasattr(row[0], 'value') else str(row[0]): (row[1], float(row[2])) for row in claims_by_status_raw}
    standard_statuses = ["FILED", "UNDER_REVIEW", "APPROVED", "REJECTED"]
    claims_by_status = [
        ClaimsByStatusStat(
            status=st,
            count=claims_status_map.get(st, (0, 0.0))[0],
            total_amount=claims_status_map.get(st, (0, 0.0))[1]
        )
        for st in standard_statuses
    ]

    # Chart 2: Policies by type
    categories = [PolicyCategory.Health, PolicyCategory.Auto, PolicyCategory.Life, PolicyCategory.Home]
    policies_by_type = []
    for cat in categories:
        cat_str = cat.value
        p_count = db.query(PolicyCatalog).filter(PolicyCatalog.category == cat).count()
        purchases_count = db.query(Policy).filter(Policy.category == cat).count()
        policies_by_type.append(PoliciesByTypeStat(
            type=cat_str.upper(),
            count=p_count,
            total_purchases=purchases_count
        ))

    # Chart 3: Monthly claims trend
    all_claims = db.query(Claim).all()
    monthly_data = defaultdict(lambda: {"submitted": 0, "approved": 0, "rejected": 0, "amount": 0.0})
    
    for c in all_claims:
        date_val = c.filed_at or c.incident_date
        month_key = date_val.strftime("%b %Y") if date_val else "Recent"
        
        status_str = c.status.value if hasattr(c.status, 'value') else str(c.status)
        if status_str == "APPROVED":
            monthly_data[month_key]["approved"] += 1
        elif status_str == "REJECTED":
            monthly_data[month_key]["rejected"] += 1
        else:
            monthly_data[month_key]["submitted"] += 1
        monthly_data[month_key]["amount"] += float(c.amount_claimed or 0)

    monthly_claims = [
        MonthlyClaimsStat(
            month=m,
            submitted_count=vals["submitted"],
            approved_count=vals["approved"],
            rejected_count=vals["rejected"],
            total_amount=round(vals["amount"], 2)
        )
        for m, vals in list(monthly_data.items())[-6:]
    ]
    if not monthly_claims:
        monthly_claims = [
            MonthlyClaimsStat(month="Current Month", submitted_count=1, approved_count=0, rejected_count=0, total_amount=45000.0)
        ]

    # Chart 4: Premium Revenue by Policy Category
    revenue_by_cat = defaultdict(float)
    active_by_cat = defaultdict(int)

    all_issued_policies = db.query(Policy).all()
    for pur in all_issued_policies:
        cat_name = pur.category.value.upper() if hasattr(pur.category, 'value') else str(pur.category).upper()
        revenue_by_cat[cat_name] += float(pur.premium_amount or 0)
        if pur.status == PolicyStatus.ACTIVE:
            active_by_cat[cat_name] += 1

    premium_revenue = [
        PremiumRevenueStat(
            policy_type=cat.value.upper(),
            active_policies=active_by_cat[cat.value.upper()],
            total_revenue=round(revenue_by_cat[cat.value.upper()], 2)
        )
        for cat in categories
    ]

    return DashboardStatsResponse(
        total_users=total_users,
        total_customers=total_customers,
        total_agents=total_agents,
        total_claims_officers=total_claims_officers,
        total_policies=total_policies,
        active_policies=active_policies,
        total_policy_purchases=total_policy_purchases,
        total_claims=total_claims,
        pending_claims=pending_claims,
        approved_claims=approved_claims,
        rejected_claims=rejected_claims,
        expired_policies=expired_policies,
        claims_by_status=claims_by_status,
        policies_by_type=policies_by_type,
        monthly_claims=monthly_claims,
        premium_revenue=premium_revenue
    )
