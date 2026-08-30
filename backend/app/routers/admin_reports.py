from datetime import datetime, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Claim, Policy, PolicyPurchase, User
from app.schemas import (
    ClaimReportResponse,
    PolicyReportResponse,
    PremiumReportResponse,
    ClaimsByStatusStat,
    PoliciesByTypeStat,
    MonthlyClaimsStat,
    PremiumRevenueStat
)
from app.dependencies import require_admin
from app.routers.admin_claims import format_claim_detail

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])

@router.get("/claims", response_model=ClaimReportResponse)
def get_claims_report(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    claims = db.query(Claim).all()
    total_claims = len(claims)
    total_claimed_amount = sum(float(c.amount or 0) for c in claims)
    total_approved_amount = sum(float(c.amount or 0) for c in claims if c.status == "APPROVED")

    # Status stats
    claims_status_map = defaultdict(lambda: {"count": 0, "amount": 0.0})
    for c in claims:
        claims_status_map[c.status]["count"] += 1
        claims_status_map[c.status]["amount"] += float(c.amount or 0)

    claims_by_status = [
        ClaimsByStatusStat(
            status=st,
            count=claims_status_map[st]["count"],
            total_amount=round(claims_status_map[st]["amount"], 2)
        )
        for st in ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]
    ]

    # Monthly stats
    monthly_data = defaultdict(lambda: {"submitted": 0, "approved": 0, "rejected": 0, "amount": 0.0})
    for c in claims:
        month_key = c.claim_date.strftime("%b %Y") if c.claim_date else "Recent"
        if c.status == "APPROVED":
            monthly_data[month_key]["approved"] += 1
        elif c.status == "REJECTED":
            monthly_data[month_key]["rejected"] += 1
        else:
            monthly_data[month_key]["submitted"] += 1
        monthly_data[month_key]["amount"] += float(c.amount or 0)

    monthly_trend = [
        MonthlyClaimsStat(
            month=m,
            submitted_count=v["submitted"],
            approved_count=v["approved"],
            rejected_count=v["rejected"],
            total_amount=round(v["amount"], 2)
        )
        for m, v in monthly_data.items()
    ]

    claims_list = [format_claim_detail(c, db, include_relations=False) for c in claims[:50]]

    return ClaimReportResponse(
        total_claims=total_claims,
        total_claimed_amount=round(total_claimed_amount, 2),
        total_approved_amount=round(total_approved_amount, 2),
        claims_by_status=claims_by_status,
        monthly_trend=monthly_trend,
        claims_list=claims_list
    )

@router.get("/policies", response_model=PolicyReportResponse)
def get_policies_report(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    policies = db.query(Policy).all()
    total_policies = len(policies)
    active_policies = sum(1 for p in policies if p.status == "ACTIVE")
    inactive_policies = total_policies - active_policies

    policy_types = ["HEALTH", "LIFE", "VEHICLE", "TRAVEL", "HOME"]
    policies_by_type = []
    for p_type in policy_types:
        p_count = db.query(Policy).filter(Policy.type == p_type).count()
        purchases_count = db.query(PolicyPurchase).join(Policy).filter(Policy.type == p_type).count()
        policies_by_type.append(PoliciesByTypeStat(
            type=p_type,
            count=p_count,
            total_purchases=purchases_count
        ))

    popular = []
    for p in policies:
        pur_count = db.query(PolicyPurchase).filter(PolicyPurchase.policy_id == p.id).count()
        popular.append({
            "policy_id": p.id,
            "policy_number": p.policy_number,
            "name": p.name,
            "type": p.type,
            "premium": p.premium,
            "purchases_count": pur_count,
            "total_revenue": round(pur_count * float(p.premium), 2)
        })
    popular.sort(key=lambda x: x["purchases_count"], reverse=True)

    return PolicyReportResponse(
        total_policies=total_policies,
        active_policies=active_policies,
        inactive_policies=inactive_policies,
        policies_by_type=policies_by_type,
        popular_policies=popular[:10]
    )

@router.get("/premium", response_model=PremiumReportResponse)
def get_premium_report(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    purchases = db.query(PolicyPurchase).join(Policy).all()
    total_collected = sum(float(p.policy.premium or 0) for p in purchases if p.policy)

    monthly_premium = defaultdict(float)
    rev_by_type = defaultdict(float)
    act_by_type = defaultdict(int)
    agent_rev = defaultdict(lambda: {"count": 0, "revenue": 0.0, "name": ""})

    for p in purchases:
        if p.policy:
            prem = float(p.policy.premium or 0)
            month_key = p.created_at.strftime("%b %Y") if p.created_at else "Recent"
            monthly_premium[month_key] += prem
            rev_by_type[p.policy.type] += prem
            if p.status == "ACTIVE":
                act_by_type[p.policy.type] += 1

            if p.agent:
                agent_rev[p.agent_id]["count"] += 1
                agent_rev[p.agent_id]["revenue"] += prem
                agent_rev[p.agent_id]["name"] = p.agent.full_name

    monthly_trend = [{"month": m, "total_premium": round(val, 2)} for m, val in monthly_premium.items()]
    
    revenue_by_type = [
        PremiumRevenueStat(
            policy_type=t,
            active_policies=act_by_type[t],
            total_revenue=round(rev_by_type[t], 2)
        )
        for t in ["HEALTH", "LIFE", "VEHICLE", "TRAVEL", "HOME"]
    ]

    top_agents = [
        {
            "agent_id": ag_id,
            "agent_name": data["name"],
            "policies_sold": data["count"],
            "total_revenue": round(data["revenue"], 2)
        }
        for ag_id, data in agent_rev.items()
    ]
    top_agents.sort(key=lambda x: x["total_revenue"], reverse=True)

    return PremiumReportResponse(
        total_collected_premium=round(total_collected, 2),
        monthly_premium_trend=monthly_trend,
        revenue_by_policy_type=revenue_by_type,
        top_agents_by_revenue=top_agents
    )
