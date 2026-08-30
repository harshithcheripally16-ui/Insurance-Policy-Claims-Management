from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import (
    LoginRequest,
    TokenResponse,
    UserOut,
    CustomerRegisterRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    PasswordResetRequest
)
from app.dependencies import verify_password, get_password_hash as hash_password, create_access_token
from app.dependencies import get_current_user, log_audit_action, create_notification

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_customer(payload: CustomerRegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    new_user = User(
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone.strip() if payload.phone else None,
        password_hash=hash_password(payload.password),
        role="CUSTOMER",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initial Welcome Notification
    create_notification(
        db=db,
        user_id=new_user.id,
        title="Welcome to SecureCare Insurance!",
        message="Your customer account has been created. You can now browse policy plans and subscribe to coverage.",
        notification_type="SUCCESS",
        link="/customer/policies"
    )

    # Log Audit Trail
    log_audit_action(
        db=db,
        admin_id=None,
        action="CUSTOMER_REGISTERED",
        target_type="USER",
        target_id=str(new_user.id),
        details=f"Customer {new_user.full_name} ({new_user.email}) registered online."
    )

    token_data = {
        "sub": str(new_user.id),
        "email": new_user.email,
        "role": new_user.role,
        "full_name": new_user.full_name
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact your administrator."
        )
    
    # Generate JWT token
    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token_data = {
        "sub": user.email,
        "email": user.email,
        "role": role_str,
        "full_name": user.name
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.post("/send-otp")
def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    import random
    from datetime import datetime, timedelta
    from app.models import OTPRecord
    from app.services.smtp_service import send_otp_email

    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if payload.purpose == "FORGOT_PASSWORD" and not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email address."
        )

    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Clear old OTPs for this email & purpose
    db.query(OTPRecord).filter(
        OTPRecord.email == email_clean,
        OTPRecord.purpose == payload.purpose
    ).delete()

    otp_entry = OTPRecord(
        email=email_clean,
        otp_code=otp_code,
        purpose=payload.purpose,
        expires_at=expires_at
    )
    db.add(otp_entry)
    db.commit()

    # Send Live Branded HTML Email via SMTP
    email_sent = send_otp_email(
        to_email=email_clean,
        otp_code=otp_code,
        purpose=payload.purpose
    )

    return {
        "status": "success",
        "message": f"Verification code sent to {email_clean}",
        "email_sent": email_sent
    }

@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    from datetime import datetime
    from app.models import OTPRecord

    email_clean = payload.email.lower().strip()
    otp_clean = payload.otp.strip()

    record = db.query(OTPRecord).filter(
        OTPRecord.email == email_clean,
        OTPRecord.otp_code == otp_clean,
        OTPRecord.purpose == payload.purpose
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please check your email and try again."
        )

    if record.expires_at < datetime.utcnow():
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new one."
        )

    return {
        "status": "success",
        "message": "OTP verified successfully."
    }

@router.post("/reset-password")
def reset_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    from datetime import datetime
    from app.models import OTPRecord

    email_clean = payload.email.lower().strip()
    otp_clean = payload.otp.strip()

    record = db.query(OTPRecord).filter(
        OTPRecord.email == email_clean,
        OTPRecord.otp_code == otp_clean,
        OTPRecord.purpose == "FORGOT_PASSWORD"
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code."
        )

    if record.expires_at < datetime.utcnow():
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new one."
        )

    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    user.password_hash = hash_password(payload.new_password)
    db.delete(record)
    db.commit()

    # Log Audit Action
    log_audit_action(
        db=db,
        admin_id=user.id if user.role == "ADMIN" else None,
        action="PASSWORD_RESET_VIA_OTP",
        target_type="USER",
        target_id=str(user.id),
        details=f"User {user.name} ({user.email}) successfully reset password using Email OTP verification."
    )

    return {
        "status": "success",
        "message": "Password has been successfully updated. You can now log in."
    }

