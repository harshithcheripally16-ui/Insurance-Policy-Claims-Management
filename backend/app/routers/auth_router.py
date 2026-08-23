import random
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models import User, UserRole, OTPRecord
from app.schemas import (
    UserCreate, UserOut, Token, SendOTPRequest, VerifyOTPRequest, PasswordResetRequest,
    ProfilePictureUpdate, ProfileUpdate
)
from app.dependencies import (
    verify_password, get_password_hash, create_access_token, get_current_user
)
from app.services.smtp_service import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Token)
def login(
    req: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    if user_in.otp:
        otp_rec = db.query(OTPRecord).filter(
            OTPRecord.email == user_in.email,
            OTPRecord.otp_code == user_in.otp,
            OTPRecord.purpose == "REGISTER",
            OTPRecord.expires_at > datetime.datetime.utcnow()
        ).order_by(OTPRecord.id.desc()).first()
        
        if not otp_rec:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    hashed = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hashed,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    otp_rec = OTPRecord(
        email=req.email,
        otp_code=otp_code,
        purpose=req.purpose,
        expires_at=expires_at
    )
    db.add(otp_rec)
    db.commit()

    send_otp_email(req.email, otp_code, req.purpose)
    return {"message": "OTP code dispatched successfully", "email": req.email, "demo_otp": otp_code}

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_rec = db.query(OTPRecord).filter(
        OTPRecord.email == req.email,
        OTPRecord.otp_code == req.otp,
        OTPRecord.purpose == req.purpose,
        OTPRecord.expires_at > datetime.datetime.utcnow()
    ).order_by(OTPRecord.id.desc()).first()

    if not otp_rec:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    otp_rec = db.query(OTPRecord).filter(
        OTPRecord.email == req.email,
        OTPRecord.otp_code == req.otp,
        OTPRecord.purpose == "FORGOT_PASSWORD",
        OTPRecord.expires_at > datetime.datetime.utcnow()
    ).order_by(OTPRecord.id.desc()).first()

    if not otp_rec:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.put("/profile-picture", response_model=UserOut)
def update_profile_picture(
    req: ProfilePictureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.avatar_url = req.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    req: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.email and req.email != current_user.email:
        existing = db.query(User).filter(User.email == req.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered by another user")
        current_user.email = req.email

    if req.name is not None:
        current_user.name = req.name
    if req.phone is not None:
        current_user.phone = req.phone
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
