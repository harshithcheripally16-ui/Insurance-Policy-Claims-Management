from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, Policy, Claim, Document, ClaimStatus
from app.dependencies import require_agent

router = APIRouter(prefix="/api/agent/claims", tags=["Agent Claims"])

@router.get("")
def get_agent_claims(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    aid = agent.id

    agent_policies = db.query(Policy).filter((Policy.agent_id == aid) | (Policy.agent_id == None)).all()
    policy_ids = [p.id for p in agent_policies]

    if not policy_ids:
        return {"items": [], "total": 0, "page": page, "page_size": page_size}

    query = db.query(Claim).filter(Claim.policy_id.in_(policy_ids))

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(Claim.claim_number.ilike(search_term), Claim.description.ilike(search_term))
        )

    if status and status.upper() in ["SUBMITTED", "FILED", "UNDER_REVIEW", "APPROVED", "REJECTED"]:
        st = status.upper()
        if st == "SUBMITTED":
            st = "FILED"
        query = query.filter(Claim.status == st)

    total = query.count()
    claims = query.order_by(Claim.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for c in claims:
        pol = c.policy
        cust = c.customer
        docs_count = db.query(Document).filter(Document.claim_id == c.id).count()
        st_str = c.status.value if hasattr(c.status, 'value') else str(c.status)
        items.append({
            "id": c.id,
            "claim_number": c.claim_number,
            "policy_name": pol.title if pol else "N/A",
            "policy_number": pol.policy_number if pol else "N/A",
            "customer_name": cust.name if cust else "N/A",
            "amount": c.amount_claimed,
            "reason": c.description,
            "status": st_str,
            "claim_date": c.filed_at,
            "documents_count": docs_count,
        })

    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/{claim_id}")
def get_claim_detail(
    claim_id: int,
    db: Session = Depends(get_db),
    agent: User = Depends(require_agent)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    pol = claim.policy
    cust = claim.customer
    docs = db.query(Document).filter(Document.claim_id == claim.id).all()
    st_str = claim.status.value if hasattr(claim.status, 'value') else str(claim.status)
    cat_str = pol.category.value if pol and hasattr(pol.category, 'value') else "N/A"

    return {
        "id": claim.id,
        "claim_number": claim.claim_number,
        "amount": claim.amount_claimed,
        "reason": claim.description,
        "status": st_str,
        "claim_date": claim.filed_at,
        "customer": {
            "id": cust.id if cust else None,
            "full_name": cust.name if cust else "N/A",
            "email": cust.email if cust else "N/A",
            "phone": cust.phone if cust else None,
        },
        "policy": {
            "policy_number": pol.policy_number if pol else "N/A",
            "name": pol.title if pol else "N/A",
            "type": cat_str,
            "premium": pol.premium_amount if pol else 0,
        },
        "documents": [{
            "id": d.id,
            "file_name": d.file_name,
            "file_type": d.file_type,
            "uploaded_date": d.uploaded_date,
        } for d in docs],
    }
