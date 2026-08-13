import json
from datetime import datetime

def calculate_claim_risk(
    claim_amount: float,
    max_coverage: float,
    policy_start_date: datetime,
    incident_date: datetime,
    doc_count: int,
    recent_claims_count: int
) -> dict:
    """
    Automated Python Risk & Fraud Scoring Engine
    Calculates a risk score (0 - 100) and returns flags for Claims Officer evaluation.
    """
    risk_score = 0
    flags = []

    # 1. Coverage Ratio Indicator
    coverage_ratio = claim_amount / max_coverage if max_coverage > 0 else 1.0
    if coverage_ratio > 0.8:
        risk_score += 35
        flags.append("High Claim Amount (>80% of Policy Limit)")
    elif coverage_ratio > 0.5:
        risk_score += 20
        flags.append("Moderate Claim Amount (>50% of Policy Limit)")

    # 2. Early Claim Window (incident close to policy start)
    days_since_start = (incident_date - policy_start_date).days
    if days_since_start < 15:
        risk_score += 35
        flags.append("Incident occurred within 15 days of Policy Start Date")
    elif days_since_start < 30:
        risk_score += 20
        flags.append("Incident occurred within 30 days of Policy Start Date")

    # 3. Missing Documentation Check
    if doc_count == 0:
        risk_score += 25
        flags.append("Zero Supporting Documents Attached at Submission")

    # 4. Multiple Claims Velocity Check
    if recent_claims_count >= 2:
        risk_score += 30
        flags.append(f"Multiple Claims ({recent_claims_count}) submitted on policy recently")
    elif recent_claims_count == 1:
        risk_score += 10
        flags.append("Previous claim exists on this policy")

    # Final Risk Level Thresholds
    final_score = min(risk_score, 100)
    if final_score >= 60:
        risk_level = "HIGH"
    elif final_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_score": final_score,
        "risk_level": risk_level,
        "fraud_flags": json.dumps(flags)
    }
