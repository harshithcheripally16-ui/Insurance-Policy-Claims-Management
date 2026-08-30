import jwt
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SALT = b"insurcare_secure_salt_2026"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        calc = get_password_hash(plain_password)
        return hmac.compare_digest(calc, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), SALT, 100000).hex()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        email = payload.get("email")
        if not sub and not email:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user and sub:
        sub_str = str(sub)
        if sub_str.isdigit():
            user = db.query(User).filter(User.id == int(sub_str)).first()
        if not user:
            user = db.query(User).filter(User.email == sub_str).first()

    if user is None:
        raise credentials_exception
    return user

def require_roles(*roles: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return role_checker

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user

def require_customer(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Customer role required")
    return current_user

def require_claims_officer(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.CLAIMS_OFFICER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Claims Officer role required")
    return current_user

def log_audit_action(db: Session, admin_id: Optional[int], action: str, target_type: Optional[str] = None, target_id: Optional[str] = None, details: Optional[str] = None):
    try:
        from app.models import AuditLog
        log = AuditLog(admin_id=admin_id, action=action, target_type=target_type, target_id=target_id, details=details)
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()

def create_notification(db: Session, user_id: int, title: str, message: str, channel: str = "IN_APP", notification_type: str = "INFO", link: Optional[str] = None):
    try:
        from app.models import Notification
        notif = Notification(user_id=user_id, title=title, message=message, channel=channel)
        db.add(notif)
        db.commit()
    except Exception:
        db.rollback()

def require_agent(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.AGENT, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Agent role required")
    return current_user
