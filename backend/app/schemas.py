from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models import UserRole, PolicyStatus, ClaimStatus, DocType, VerificationStatus

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.CUSTOMER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = "REGISTRATION" # REGISTRATION, FORGOT_PASSWORD

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: str = "REGISTRATION"

class RegisterWithOTPRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    otp_code: str
    phone: Optional[str] = None
    address: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- POLICY CATALOG SCHEMAS ---
class PolicyCatalogBase(BaseModel):
    code: str
    title: str
    type: str
    description: str
    base_premium: float
    max_coverage: float
    term_months: int = 12

class PolicyCatalogCreate(PolicyCatalogBase):
    pass

class PolicyCatalogResponse(PolicyCatalogBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- POLICY SCHEMAS ---
class PolicyPurchaseRequest(BaseModel):
    catalog_id: int
    customer_id: Optional[int] = None # If Agent/Admin purchasing for a customer

class PolicyUpdateRequest(BaseModel):
    title: Optional[str] = None
    coverage_amount: Optional[float] = None
    premium: Optional[float] = None
    status: Optional[PolicyStatus] = None
    end_date: Optional[datetime] = None

class PolicyResponse(BaseModel):
    id: int
    policy_number: str
    type: str
    title: str
    coverage_amount: float
    premium: float
    start_date: datetime
    end_date: datetime
    status: PolicyStatus
    customer_id: int
    customer: Optional[UserResponse] = None
    agent_id: Optional[int] = None
    agent: Optional[UserResponse] = None
    created_at: datetime
    last_reminder_sent: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- DOCUMENT SCHEMAS ---
class DocumentResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    doc_type: DocType
    status: VerificationStatus
    notes: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentVerifyRequest(BaseModel):
    status: VerificationStatus
    notes: Optional[str] = None

# --- REVIEW SCHEMAS ---
class ReviewCreate(BaseModel):
    decision: ClaimStatus # APPROVED, REJECTED, DOCUMENTS_REQUIRED
    remarks: str

class ReviewResponse(BaseModel):
    id: int
    decision: ClaimStatus
    remarks: str
    officer_id: int
    officer: Optional[UserResponse] = None
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- CLAIM SCHEMAS ---
class ClaimCreate(BaseModel):
    policy_id: int
    reason: str
    description: str
    amount: float
    incident_date: datetime

class ClaimResponse(BaseModel):
    id: int
    claim_number: str
    reason: str
    description: str
    amount: float
    incident_date: datetime
    status: ClaimStatus
    risk_score: int
    risk_level: str
    fraud_flags: str # JSON String
    policy_id: int
    policy: Optional[PolicyResponse] = None
    customer_id: int
    customer: Optional[UserResponse] = None
    documents: List[DocumentResponse] = []
    reviews: List[ReviewResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- NOTIFICATION SCHEMAS ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- DASHBOARD / ANALYTICS SCHEMAS ---
class DashboardAnalyticsResponse(BaseModel):
    total_users: int
    total_policies: int
    active_policies: int
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    total_claim_amount: float
    total_premium_collected: float
    loss_ratio: float
    claims_by_status: dict
    risk_level_distribution: dict
