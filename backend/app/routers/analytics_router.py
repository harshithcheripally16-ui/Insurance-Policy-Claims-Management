from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, Policy, PolicyStatus, PolicyCategory, UserRole
from app.schemas import AnalyticsSummary
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=AnalyticsSummary)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN))
):
    total_client_policies = db.query(Policy).count()
    active_policies = db.query(Policy).filter(Policy.status == PolicyStatus.ACTIVE).count()
    
    total_premiums = db.query(func.sum(Policy.premium_amount)).scalar() or 0.0
    client_accounts = db.query(User).filter(User.role == UserRole.CUSTOMER).count()

    # Sales & Issued Policies Aggregation by Category
    sales_by_cat = []
    for cat in PolicyCategory:
        cat_policies = db.query(Policy).filter(Policy.category == cat).all()
        count = len(cat_policies)
        revenue = sum(p.premium_amount for p in cat_policies)
        
        sales_by_cat.append({
            "category": cat.value,
            "policies_issued": count,
            "revenue_collected": revenue
        })

    return {
        "total_client_policies": total_client_policies,
        "active_policies": active_policies,
        "total_premiums_collected": total_premiums,
        "client_accounts": client_accounts,
        "sales_by_category": sales_by_cat
    }
