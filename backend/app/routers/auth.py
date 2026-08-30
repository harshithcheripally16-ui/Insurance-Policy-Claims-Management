from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserOut, CustomerRegisterRequest
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

