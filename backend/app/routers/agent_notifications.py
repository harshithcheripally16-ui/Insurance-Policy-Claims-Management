from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification, User
from app.schemas import NotificationOut, NotificationListResponse, GenericMessageResponse
from app.dependencies import require_agent

router = APIRouter(prefix="/api/agent/notifications", tags=["Agent Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_agent_notifications(
    db: Session = Depends(get_db),
    current_agent: User = Depends(require_agent)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_agent.id
    ).order_by(Notification.id.asc()).all()

    unread_count = sum(1 for n in notifs if not n.is_read)
    items = [NotificationOut.model_validate(n) for n in notifs]

    return NotificationListResponse(
        items=items,
        unread_count=unread_count,
        total=len(items)
    )


@router.patch("/{id}/read", response_model=NotificationOut)
def mark_notification_read(
    id: int,
    db: Session = Depends(get_db),
    current_agent: User = Depends(require_agent)
):
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_agent.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found or access denied.")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return NotificationOut.model_validate(notif)


@router.patch("/read-all", response_model=GenericMessageResponse)
def mark_all_read(
    db: Session = Depends(get_db),
    current_agent: User = Depends(require_agent)
):
    db.query(Notification).filter(
        Notification.user_id == current_agent.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return GenericMessageResponse(message="All notifications marked as read.")
