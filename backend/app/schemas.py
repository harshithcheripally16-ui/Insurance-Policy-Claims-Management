import datetime
from typing import Optional, List, Any, Union
from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator
from app.models import UserRole, PolicyStatus, ClaimStatus, PolicyCategory

# ---------------------------------------------------------------------------
# Token Schemas
# ---------------------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True

class UserCreate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = UserRole.CUSTOMER
    password: str
    otp: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_name_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "full_name" in values and not values.get("name"):
                values["name"] = values["full_name"]
            elif "name" in values and not values.get("full_name"):
                values["full_name"] = values["name"]
        return values

class CustomerRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_update_names(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "full_name" in values and not values.get("name"):
                values["name"] = values["full_name"]
            elif "name" in values and not values.get("full_name"):
                values["full_name"] = values["name"]
        return values

class ProfilePictureUpdate(BaseModel):
    avatar_url: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_profile_name(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "full_name" in values and not values.get("name"):
                values["name"] = values["full_name"]
            elif "name" in values and not values.get("full_name"):
                values["full_name"] = values["name"]
        return values

class UserOut(UserBase):
    id: int
    full_name: Optional[str] = None
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def set_full_name(cls, data: Any) -> Any:
        if hasattr(data, "name") and not getattr(data, "full_name", None):
            setattr(data, "full_name", data.name)
        elif isinstance(data, dict):
            if "name" in data and "full_name" not in data:
                data["full_name"] = data["name"]
        return data

class CustomerOut(BaseModel):
    id: int
    display_id: int  # Reindexed sequential 1, 2, 3...
    name: str
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    total_policies: int = 0
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class UserListResponse(BaseModel):
    total: int
    page: Optional[int] = 1
    page_size: Optional[int] = 10
    items: List[Any] = []

# ---------------------------------------------------------------------------
# Policy Catalog Schemas
# ---------------------------------------------------------------------------
class PolicyCatalogBase(BaseModel):
    title: str
    category: PolicyCategory
    description: Optional[str] = None
    base_premium: float = Field(..., ge=0.0)
    coverage_amount: float = Field(default=0.0, ge=0.0)
    features: Optional[str] = None
    duration_months: int = Field(default=12, ge=1)
    bestseller_tag: bool = False
    status: str = "ACTIVE"

class PolicyCatalogCreate(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    category: Optional[PolicyCategory] = None
    type: Optional[str] = None
    description: Optional[str] = None
    base_premium: Optional[float] = None
    premium: Optional[float] = None
    coverage_amount: Optional[float] = 0.0
    features: Optional[str] = None
    duration_months: Optional[int] = 12
    bestseller_tag: Optional[bool] = False
    status: Optional[str] = "ACTIVE"
    policy_number: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "name" in values and not values.get("title"):
                values["title"] = values["name"]
            elif "title" in values and not values.get("name"):
                values["name"] = values["title"]

            if "premium" in values and values.get("base_premium") is None:
                values["base_premium"] = values["premium"]
            elif "base_premium" in values and values.get("premium") is None:
                values["premium"] = values["base_premium"]

            if "type" in values and not values.get("category"):
                val_type = str(values["type"]).lower()
                for cat in PolicyCategory:
                    if cat.value.lower() == val_type or cat.name.lower() == val_type:
                        values["category"] = cat
                        break
                if not values.get("category"):
                    values["category"] = PolicyCategory.Health

            # Validation check for negative premium / duration
            p = values.get("base_premium") if values.get("base_premium") is not None else values.get("premium")
            if p is not None and float(p) < 0:
                raise ValueError("Premium amount cannot be negative")
            d = values.get("duration_months")
            if d is not None and int(d) < 1:
                raise ValueError("Duration months must be at least 1")
        return values

class PolicyCatalogUpdate(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    category: Optional[PolicyCategory] = None
    type: Optional[str] = None
    description: Optional[str] = None
    base_premium: Optional[float] = None
    premium: Optional[float] = None
    coverage_amount: Optional[float] = None
    features: Optional[str] = None
    duration_months: Optional[int] = None
    bestseller_tag: Optional[bool] = None
    status: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_update_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "name" in values and not values.get("title"):
                values["title"] = values["name"]
            if "premium" in values and values.get("base_premium") is None:
                values["base_premium"] = values["premium"]
            if "type" in values and not values.get("category"):
                val_type = str(values["type"]).lower()
                for cat in PolicyCategory:
                    if cat.value.lower() == val_type or cat.name.lower() == val_type:
                        values["category"] = cat
                        break
        return values

class PolicyCatalogOut(PolicyCatalogBase):
    id: int
    name: Optional[str] = None
    type: Optional[str] = None
    premium: Optional[float] = None
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        if hasattr(data, "title"):
            if not getattr(data, "name", None):
                setattr(data, "name", data.title)
            if not getattr(data, "premium", None):
                setattr(data, "premium", data.base_premium)
            if not getattr(data, "type", None):
                setattr(data, "type", data.category.value if hasattr(data.category, "value") else str(data.category))
        elif isinstance(data, dict):
            data["name"] = data.get("title")
            data["premium"] = data.get("base_premium")
            cat = data.get("category")
            data["type"] = cat.value if hasattr(cat, "value") else str(cat)
        return data

class PolicyCatalogListResponse(BaseModel):
    total: int
    items: List[PolicyCatalogOut]

# ---------------------------------------------------------------------------
# Issued Policy Schemas
# ---------------------------------------------------------------------------
class PolicyCreate(BaseModel):
    customer_id: int
    catalog_id: Optional[int] = None
    title: str
    category: PolicyCategory
    premium_amount: float = Field(..., ge=0.0)
    coverage_amount: float = Field(default=0.0, ge=0.0)
    valid_until: datetime.datetime

class IssuePolicyRequest(BaseModel):
    customer_id: int
    catalog_id: int
    tenure_years: int = Field(default=1, ge=1)

class PolicyPurchaseCreate(BaseModel):
    policy_id: int  # catalog_id in new schema

class PolicyOut(BaseModel):
    id: int
    policy_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    agent_id: Optional[int] = None
    agent_name: Optional[str] = None
    catalog_id: Optional[int] = None
    title: Optional[str] = None
    category: Optional[PolicyCategory] = None
    premium_amount: Optional[float] = None
    coverage_amount: Optional[float] = None
    status: Optional[Union[PolicyStatus, str]] = None
    valid_from: Optional[datetime.datetime] = None
    valid_until: Optional[datetime.datetime] = None
    last_reminder_sent: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None

    # Compatibility fields
    name: Optional[str] = None
    policy_name: Optional[str] = None
    type: Optional[str] = None
    premium: Optional[float] = None
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    policy_id: Optional[int] = None
    duration_months: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def populate_policy_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("name") and data.get("title"):
                data["name"] = data.get("title")
            if not data.get("title") and data.get("name"):
                data["title"] = data.get("name")
            if not data.get("policy_name"):
                data["policy_name"] = data.get("name") or data.get("title")

            if data.get("premium") is None and data.get("premium_amount") is not None:
                data["premium"] = data.get("premium_amount")
            elif data.get("premium_amount") is None and data.get("premium") is not None:
                data["premium_amount"] = data.get("premium")

            if not data.get("start_date") and data.get("valid_from"):
                data["start_date"] = data.get("valid_from")
            if not data.get("end_date") and data.get("valid_until"):
                data["end_date"] = data.get("valid_until")

            if not data.get("policy_id"):
                data["policy_id"] = data.get("catalog_id") or data.get("id")

            if not data.get("type") and data.get("category"):
                cat = data.get("category")
                data["type"] = cat.value if hasattr(cat, "value") else (str(cat) if cat else None)
        elif hasattr(data, "__dict__") or not isinstance(data, (str, int, float)):
            title_val = getattr(data, "title", None)
            name_val = getattr(data, "name", None)
            if not name_val and title_val:
                try:
                    setattr(data, "name", title_val)
                except Exception:
                    pass

            prem_amt = getattr(data, "premium_amount", None)
            prem = getattr(data, "premium", None)
            if prem is None and prem_amt is not None:
                try:
                    setattr(data, "premium", prem_amt)
                except Exception:
                    pass

            cat_val = getattr(data, "category", None)
            type_val = getattr(data, "type", None)
            if not type_val and cat_val:
                cat_str = cat_val.value if hasattr(cat_val, "value") else (str(cat_val) if cat_val else None)
                try:
                    setattr(data, "type", cat_str)
                except Exception:
                    pass
        return data

class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    category: Optional[Union[PolicyCategory, str]] = None
    type: Optional[str] = None
    premium_amount: Optional[float] = None
    base_premium: Optional[float] = None
    premium: Optional[float] = None
    coverage_amount: Optional[float] = None
    description: Optional[str] = None
    duration_months: Optional[int] = None
    status: Optional[Union[PolicyStatus, str]] = None
    valid_until: Optional[datetime.datetime] = None

class PolicyCatalogCreate(BaseModel):
    policy_number: Optional[str] = None
    name: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    category: Optional[Union[PolicyCategory, str]] = None
    description: Optional[str] = None
    premium: Optional[float] = None
    base_premium: Optional[float] = None
    premium_amount: Optional[float] = None
    coverage_amount: Optional[float] = None
    duration_months: Optional[int] = 12
    status: Optional[str] = "ACTIVE"
    features: Optional[str] = None

class PolicyCatalogUpdate(BaseModel):
    policy_number: Optional[str] = None
    name: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    category: Optional[Union[PolicyCategory, str]] = None
    description: Optional[str] = None
    premium: Optional[float] = None
    base_premium: Optional[float] = None
    premium_amount: Optional[float] = None
    coverage_amount: Optional[float] = None
    duration_months: Optional[int] = None
    status: Optional[str] = None
    features: Optional[str] = None

class PolicyCatalogStatusUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None

class PolicyStatusUpdate(BaseModel):
    status: Optional[Union[PolicyStatus, str]] = None
    is_active: Optional[bool] = None

class PolicyListResponse(BaseModel):
    total: int
    page: Optional[int] = 1
    page_size: Optional[int] = 10
    items: List[Any] = []

PolicyPurchaseOut = PolicyOut

# ---------------------------------------------------------------------------
# Claim Schemas
# ---------------------------------------------------------------------------
class ClaimCreate(BaseModel):
    policy_id: Optional[int] = None
    policy_purchase_id: Optional[int] = None
    incident_date: Optional[datetime.datetime] = None
    claim_date: Optional[datetime.datetime] = None
    amount_claimed: Optional[float] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    reason: Optional[str] = None
    document_name: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_claim_input(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "policy_purchase_id" in values and not values.get("policy_id"):
                values["policy_id"] = values["policy_purchase_id"]
            elif "policy_id" in values and not values.get("policy_purchase_id"):
                values["policy_purchase_id"] = values["policy_id"]

            if "reason" in values and not values.get("description"):
                values["description"] = values["reason"]
            elif "description" in values and not values.get("reason"):
                values["reason"] = values["description"]

            if "amount" in values and values.get("amount_claimed") is None:
                values["amount_claimed"] = values["amount"]
            elif "amount_claimed" in values and values.get("amount") is None:
                values["amount"] = values["amount_claimed"]

            if "claim_date" in values and not values.get("incident_date"):
                values["incident_date"] = values["claim_date"]
            elif not values.get("incident_date"):
                values["incident_date"] = datetime.datetime.utcnow()

            amt = values.get("amount_claimed")
            if amt is not None and float(amt) <= 0:
                raise ValueError("Claim amount must be greater than zero")
        return values

class ClaimOut(BaseModel):
    id: int
    claim_number: str
    policy_id: int
    policy_title: Optional[str] = None
    customer_id: int
    customer_name: Optional[str] = None
    incident_date: datetime.datetime
    amount_claimed: float
    description: str
    status: ClaimStatus
    risk_score: float = 0.0
    document_name: Optional[str] = None
    filed_at: datetime.datetime

    # Compatibility aliases
    amount: Optional[float] = None
    reason: Optional[str] = None
    claim_date: Optional[datetime.datetime] = None
    policy_purchase_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def populate_claim_aliases(cls, data: Any) -> Any:
        if hasattr(data, "amount_claimed"):
            if not getattr(data, "amount", None):
                setattr(data, "amount", data.amount_claimed)
            if not getattr(data, "reason", None):
                setattr(data, "reason", data.description)
            if not getattr(data, "claim_date", None):
                setattr(data, "claim_date", data.incident_date)
            if not getattr(data, "policy_purchase_id", None):
                setattr(data, "policy_purchase_id", data.policy_id)
        elif isinstance(data, dict):
            data["amount"] = data.get("amount_claimed")
            data["reason"] = data.get("description")
            data["claim_date"] = data.get("incident_date")
            data["policy_purchase_id"] = data.get("policy_id")
        return data

class ClaimStatusUpdate(BaseModel):
    status: ClaimStatus
    remarks: Optional[str] = None

class ClaimListResponse(BaseModel):
    total: int
    page: Optional[int] = 1
    page_size: Optional[int] = 10
    items: List[Any] = []

# ---------------------------------------------------------------------------
# Document Schemas
# ---------------------------------------------------------------------------
class DocumentOut(BaseModel):
    id: int
    claim_id: int
    file_name: str
    file_path: str
    file_type: str
    uploaded_date: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentListResponse(BaseModel):
    total: int
    items: List[DocumentOut]

# ---------------------------------------------------------------------------
# Claim Review Schemas
# ---------------------------------------------------------------------------
class ClaimReviewCreate(BaseModel):
    decision: str
    remarks: str

class ClaimReviewOut(BaseModel):
    id: int
    claim_id: int
    officer_id: int
    officer_name: Optional[str] = None
    decision: str
    remarks: str
    review_date: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# ---------------------------------------------------------------------------
# Audit Log Schemas
# ---------------------------------------------------------------------------
class AuditLogOut(BaseModel):
    id: int
    admin_id: Optional[int] = None
    admin_name: Optional[str] = None
    action: str
    target_type: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogOut]

# ---------------------------------------------------------------------------
# Notification Schemas
# ---------------------------------------------------------------------------
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    channel: str = "IN_APP"
    type: str = "INFO"
    link: Optional[str] = None
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class NotificationListResponse(BaseModel):
    total: int
    unread_count: int = 0
    items: List[NotificationOut]

# ---------------------------------------------------------------------------
# OTP Schemas
# ---------------------------------------------------------------------------
class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = "REGISTER"  # REGISTER or FORGOT_PASSWORD

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    purpose: str = "REGISTER"

class PasswordResetRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# ---------------------------------------------------------------------------
# Analytics & Dashboard Schemas
# ---------------------------------------------------------------------------
class AnalyticsSummary(BaseModel):
    total_client_policies: int
    active_policies: int
    total_premiums_collected: float
    client_accounts: int
    sales_by_category: List[dict]

class AdminDashboardKPIs(BaseModel):
    total_users: int
    total_customers: int
    total_agents: int
    total_officers: int
    total_policies: int
    active_policies: int
    total_purchases: int
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    total_premium_revenue: float
    claims_by_status: List[dict]
    policies_by_type: List[dict]
    monthly_trends: List[dict]

class CustomerDashboardKPIs(BaseModel):
    customer_name: str
    total_purchases: int
    active_policies: int
    total_claims: int
    unread_notifications: int
    recent_purchases: List[dict]
    recent_claims: List[dict]

class OfficerDashboardKPIs(BaseModel):
    pending_claims: int
    under_review_claims: int
    approved_claims: int
    rejected_claims: int
    total_reviewed: int

class AgentDashboardKPIs(BaseModel):
    agent_name: str
    total_clients: int
    active_policies: int
    total_commission: float
    monthly_sales: float


# Additional Admin / Agent / Officer Schemas
class AgentCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    is_active: bool = True

class AgentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class AgentDetailOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: datetime.datetime
    purchases_handled_count: int = 0
    total_premium_generated: float = 0.0
    model_config = ConfigDict(from_attributes=True)

class AgentListResponse(BaseModel):
    total: int
    page: int = 1
    page_size: int = 10
    items: List[AgentDetailOut]

class OfficerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    is_active: bool = True

class OfficerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class OfficerDetailOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: datetime.datetime
    reviews_count: int = 0
    approved_count: int = 0
    rejected_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class OfficerListResponse(BaseModel):
    total: int
    page: int = 1
    page_size: int = 10
    items: List[OfficerDetailOut]

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserDetailOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    policies_count: int = 0
    claims_count: int = 0
    purchases_handled_count: int = 0
    reviews_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class GenericMessageResponse(BaseModel):
    message: str

class CustomerDetailOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: datetime.datetime
    policies_count: int = 0
    claims_count: int = 0
    policies: List[dict] = []
    claims: List[dict] = []
    model_config = ConfigDict(from_attributes=True)

class CustomerListResponse(BaseModel):
    total: int
    page: int = 1
    page_size: int = 10
    items: List[CustomerDetailOut]

class PurchaseCustomerOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None

class PurchasePolicyOut(BaseModel):
    id: int
    policy_number: str
    name: str
    type: str
    premium: float
    duration_months: int

class PurchaseAgentOut(BaseModel):
    id: int
    full_name: str
    email: str

class PurchaseDetailOut(BaseModel):
    id: int
    policy_id: int
    customer_id: int
    agent_id: Optional[int] = None
    start_date: datetime.datetime
    end_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    customer: Optional[PurchaseCustomerOut] = None
    policy: Optional[PurchasePolicyOut] = None
    agent: Optional[PurchaseAgentOut] = None
    claims_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class PurchaseListResponse(BaseModel):
    total: int
    page: int = 1
    page_size: int = 10
    items: List[PurchaseDetailOut]

class DashboardStatsResponse(BaseModel):
    total_users: int
    total_customers: int
    total_agents: int
    total_claims_officers: int
    total_policies: int
    active_policies: int
    total_policy_purchases: int
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    expired_policies: int
    claims_by_status: List[Any] = []
    policies_by_type: List[Any] = []
    monthly_claims: List[Any] = []
    premium_revenue: List[Any] = []

class ClaimsByStatusStat(BaseModel):
    status: str
    count: int
    total_amount: float

class PoliciesByTypeStat(BaseModel):
    type: str
    count: int
    total_purchases: int

class MonthlyClaimsStat(BaseModel):
    month: str
    submitted_count: int
    approved_count: int
    rejected_count: int
    total_amount: float

class PremiumRevenueStat(BaseModel):
    policy_type: str
    active_policies: int
    total_revenue: float

class CustomerPurchaseCreate(BaseModel):
    policy_id: int

class CustomerPurchaseOut(BaseModel):
    id: int
    policy_id: int
    policy_name: str
    policy_number: str
    type: str
    premium: float
    duration_months: int
    start_date: datetime.datetime
    end_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    claims_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class CustomerPurchaseDetailOut(BaseModel):
    id: int
    policy_id: int
    policy_name: str
    policy_number: str
    type: str
    description: Optional[str] = None
    premium: float
    duration_months: int
    start_date: datetime.datetime
    end_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    agent_name: Optional[str] = None
    claims: List[dict] = []
    model_config = ConfigDict(from_attributes=True)

class CustomerClaimCreate(BaseModel):
    policy_purchase_id: int
    reason: str
    amount: float
    incident_date: Optional[datetime.datetime] = None

class CustomerClaimOut(BaseModel):
    id: int
    claim_number: str
    policy_purchase_id: int
    policy_name: str
    policy_number: str
    reason: str
    amount: float
    claim_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    documents_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class CustomerClaimDetailOut(BaseModel):
    id: int
    claim_number: str
    policy_purchase_id: int
    policy_name: str
    policy_number: str
    policy_type: str
    reason: str
    amount: float
    claim_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    documents: List[Any] = []
    reviews: List[Any] = []
    model_config = ConfigDict(from_attributes=True)

class CustomerDashboardResponse(BaseModel):
    customer_name: str
    total_policies: int
    active_policies: int
    expired_policies: int
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    unread_notifications: int
    recent_purchases: List[CustomerPurchaseOut] = []
    recent_claims: List[CustomerClaimOut] = []

class OfficerClaimOut(BaseModel):
    id: int
    claim_number: str
    policy_purchase_id: int
    policy_name: str
    policy_number: str
    policy_type: str
    reason: str
    amount: float
    claim_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    customer_name: str
    customer_email: str
    documents_count: int = 0
    reviews_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class OfficerClaimDetailOut(BaseModel):
    id: int
    claim_number: str
    policy_purchase_id: int
    reason: str
    amount: float
    claim_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    policy_name: Optional[str] = None
    policy_number: Optional[str] = None
    policy_type: Optional[str] = None
    policy_premium: Optional[float] = None
    policy_duration_months: Optional[int] = None
    policy_start_date: Optional[datetime.datetime] = None
    policy_end_date: Optional[datetime.datetime] = None
    documents: List[Any] = []
    reviews: List[Any] = []
    model_config = ConfigDict(from_attributes=True)

class OfficerClaimListResponse(BaseModel):
    total: int
    page: int = 1
    page_size: int = 10
    items: List[OfficerClaimOut]

class OfficerDashboardResponse(BaseModel):
    officer_name: str
    total_claims: int
    submitted_claims: int
    under_review_claims: int
    approved_claims: int
    rejected_claims: int
    my_reviews_count: int
    pending_review_claims: int
    claims_by_status: List[ClaimsByStatusStat] = []
    recent_claims: List[OfficerClaimOut] = []


class ClaimDetailOut(BaseModel):
    id: int
    claim_number: str
    policy_purchase_id: int
    customer_id: int
    reason: str
    amount: float
    claim_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    customer: Optional[PurchaseCustomerOut] = None
    policy_purchase: Optional[PurchaseDetailOut] = None
    documents: List[Any] = []
    reviews: List[Any] = []
    model_config = ConfigDict(from_attributes=True)


class ClaimReportResponse(BaseModel):
    total_claims: int = 0
    submitted_claims: int = 0
    under_review_claims: int = 0
    approved_claims: int = 0
    rejected_claims: int = 0
    total_amount_claimed: float = 0.0
    total_amount_approved: float = 0.0
    by_status: List[Any] = []

class PolicyReportResponse(BaseModel):
    total_policies: int = 0
    active_policies: int = 0
    expired_policies: int = 0
    total_purchases: int = 0
    by_type: List[Any] = []

class PremiumReportResponse(BaseModel):
    total_revenue: float = 0.0
    total_active_revenue: float = 0.0
    by_type: List[Any] = []


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CustomerProfileOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class CustomerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class OfficerProfileOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class OfficerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class AgentProfileOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class AgentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
