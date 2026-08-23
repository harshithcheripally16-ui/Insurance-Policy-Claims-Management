from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models import UserRole, PolicyStatus, ClaimStatus, PolicyCategory

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: str
    otp: Optional[str] = None

class ProfilePictureUpdate(BaseModel):
    avatar_url: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CustomerOut(BaseModel):
    id: int
    display_id: int # Reindexed sequential 1, 2, 3...
    name: str
    email: EmailStr
    phone: Optional[str] = None
    total_policies: int = 0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Catalog Schemas
class PolicyCatalogBase(BaseModel):
    title: str
    category: PolicyCategory
    description: Optional[str] = None
    base_premium: float
    coverage_amount: float
    features: Optional[str] = None
    bestseller_tag: bool = False

class PolicyCatalogCreate(PolicyCatalogBase):
    pass

class PolicyCatalogOut(PolicyCatalogBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Policy Schemas
class PolicyCreate(BaseModel):
    customer_id: int
    catalog_id: Optional[int] = None
    title: str
    category: PolicyCategory
    premium_amount: float
    coverage_amount: float
    valid_until: datetime

class IssuePolicyRequest(BaseModel):
    customer_id: int
    catalog_id: int
    tenure_years: int = 1

class PolicyOut(BaseModel):
    id: int
    policy_number: str
    customer_id: int
    customer_name: Optional[str] = None
    agent_id: Optional[int] = None
    agent_name: Optional[str] = None
    catalog_id: Optional[int] = None
    title: str
    category: PolicyCategory
    premium_amount: float
    coverage_amount: float
    status: PolicyStatus
    valid_from: datetime
    valid_until: datetime
    last_reminder_sent: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PolicyStatusUpdate(BaseModel):
    status: PolicyStatus

# Claim Schemas
class ClaimCreate(BaseModel):
    policy_id: int
    incident_date: datetime
    amount_claimed: float
    description: str
    document_name: Optional[str] = None

class ClaimOut(BaseModel):
    id: int
    claim_number: str
    policy_id: int
    policy_title: Optional[str] = None
    customer_id: int
    customer_name: Optional[str] = None
    incident_date: datetime
    amount_claimed: float
    description: str
    status: ClaimStatus
    risk_score: float
    document_name: Optional[str] = None
    filed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ClaimStatusUpdate(BaseModel):
    status: ClaimStatus

# Notification Schemas
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    channel: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# OTP Schemas
class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str # REGISTER or FORGOT_PASSWORD

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    purpose: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_client_policies: int
    active_policies: int
    total_premiums_collected: float
    client_accounts: int
    sales_by_category: List[dict]
