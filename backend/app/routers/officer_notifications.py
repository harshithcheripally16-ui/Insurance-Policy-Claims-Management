from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification, User
from app.schemas import NotificationOut, NotificationListResponse, GenericMessageResponse
from app.dependencies import require_claims_officer

router = APIRouter(prefix="/api/officer/notifications", tags=["Officer Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_claims_officer)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_officer.id
    ).order_by(Notification.id.asc()).all()

    unread_count = sum(1 for n in notifs if not n.is_read)
    items = [NotificationOut.model_validate(n) for n in notifs]

    return NotificationListResponse(
        items=items,
        unread_count=unread_count,
        total=len(items)
    )


@router.patch("/{id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_claims_officer)
):
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_officer.id
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return NotificationOut.model_validate(notif)


@router.patch("/read-all", response_model=GenericMessageResponse)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_officer: User = Depends(require_claims_officer)
):
    db.query(Notification).filter(
        Notification.user_id == current_officer.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()

    return GenericMessageResponse(message="All notifications marked as read.")
