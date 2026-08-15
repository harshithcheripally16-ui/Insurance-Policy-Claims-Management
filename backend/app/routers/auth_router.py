import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, OTPCode
from app.schemas import (
    UserCreate, UserResponse, TokenResponse, UserLogin,
    SendOTPRequest, VerifyOTPRequest, RegisterWithOTPRequest, ResetPasswordRequest
)
from app.auth import get_password_hash, verify_password, create_access_token
from app.dependencies import get_current_user
from app.services.smtp_service import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Generates a 6-digit OTP and sends it via SMTP for registration or forgot password."""
    email = req.email.lower().strip()
    purpose = req.purpose.upper()

    if purpose == "FORGOT_PASSWORD":
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Account with this email address was not found")
    elif purpose == "REGISTRATION":
        user = db.query(User).filter(User.email == email).first()
        if user:
            raise HTTPException(status_code=400, detail="Email is already registered. Please sign in.")

    # Generate 6-digit random code
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now() + timedelta(minutes=10)

    # Invalidate previous un-used OTPs for this email & purpose
    db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.purpose == purpose,
        OTPCode.is_used == False
    ).update({"is_used": True})

    new_otp = OTPCode(
        email=email,
        code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False
    )
    db.add(new_otp)
    db.commit()

    # Send email via SMTP
    sent = send_otp_email(to_email=email, otp_code=otp_code, purpose=purpose)
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send OTP verification email")

    return {
        "message": f"Verification code sent to {email} via SMTP.",
        "email": email,
        "purpose": purpose,
        "otp_code_demo": otp_code # Included for instant UI testing preview
    }

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verifies a 6-digit OTP code."""
    email = req.email.lower().strip()
    purpose = req.purpose.upper()

    otp_record = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.code == req.code,
        OTPCode.purpose == purpose,
        OTPCode.is_used == False
    ).order_by(OTPCode.id.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP verification code")

    if datetime.now() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP verification code has expired. Please request a new code.")

    return {"message": "OTP verified successfully", "email": email}

@router.post("/register-with-otp", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_with_otp(req: RegisterWithOTPRequest, db: Session = Depends(get_db)):
    """Registers a new Customer account after verifying the SMTP OTP code."""
    email = req.email.lower().strip()

    # Verify OTP
    otp_record = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.code == req.otp_code,
        OTPCode.purpose == "REGISTRATION",
        OTPCode.is_used == False
    ).order_by(OTPCode.id.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP verification code")

    if datetime.now() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP verification code has expired. Please request a new code.")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Mark OTP as used
    otp_record.is_used = True
    db.commit()

    hashed_pwd = get_password_hash(req.password)
    user = User(
        email=email,
        password_hash=hashed_pwd,
        full_name=req.full_name,
        role=UserRole.CUSTOMER,
        phone=req.phone,
        address=req.address
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets user password after verifying 6-digit SMTP OTP."""
    email = req.email.lower().strip()

    otp_record = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.code == req.otp_code,
        OTPCode.purpose == "FORGOT_PASSWORD",
        OTPCode.is_used == False
    ).order_by(OTPCode.id.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP verification code")

    if datetime.now() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP verification code has expired. Please request a new code.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    # Mark OTP as used & update password
    otp_record.is_used = True
    user.password_hash = get_password_hash(req.new_password)
    db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or UserRole.CUSTOMER,
        phone=user_in.phone,
        address=user_in.address
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login-json", response_model=TokenResponse)
def login_json(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
