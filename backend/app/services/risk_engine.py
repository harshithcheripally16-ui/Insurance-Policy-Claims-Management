import datetime
from sqlalchemy.orm import Session
from app.models import Policy, Claim

def calculate_claim_risk_score(db: Session, policy_id: int, amount_claimed: float, incident_date: datetime.datetime) -> float:
    """
    Calculates a risk score (0 - 100) for a filed claim.
    Higher score indicates higher risk/scrutiny required.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        return 50.0

    score = 15.0 # Base score

    # 1. Coverage ratio factor
    if policy.coverage_amount > 0:
        ratio = amount_claimed / policy.coverage_amount
        if ratio > 0.8:
            score += 35.0
        elif ratio > 0.5:
            score += 20.0
        elif ratio > 0.25:
            score += 10.0

    # 2. Timing factor (Claim filed very shortly after policy issuance)
    if policy.created_at:
        days_since_start = (incident_date - policy.created_at).days
        if days_since_start < 15:
            score += 30.0
        elif days_since_start < 45:
            score += 15.0

    # 3. Prior claim history
    prior_claims_count = db.query(Claim).filter(
        Claim.customer_id == policy.customer_id,
        Claim.policy_id != policy_id
    ).count()
    
    score += min(prior_claims_count * 10.0, 20.0)

    return round(min(score, 99.9), 1)
