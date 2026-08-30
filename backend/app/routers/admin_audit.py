from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditLogOut, AuditLogListResponse
from app.dependencies import require_admin

router = APIRouter(prefix="/api/admin/audit-logs", tags=["Admin Audit Logs"])

@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    page: int = 1,
    page_size: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    target_type: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action.strip()}%"))
    if target_type:
        query = query.filter(AuditLog.target_type == target_type.strip().upper())

    total = query.count()
    logs = query.order_by(AuditLog.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for log in logs:
        admin_name = log.admin.full_name if log.admin else "System"
        items.append(AuditLogOut(
            id=log.id,
            admin_id=log.admin_id,
            admin_name=admin_name,
            action=log.action,
            target_type=log.target_type,
            target_id=log.target_id,
            details=log.details,
            timestamp=log.timestamp
        ))

    return AuditLogListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )
