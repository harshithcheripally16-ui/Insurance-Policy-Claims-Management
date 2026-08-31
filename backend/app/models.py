import enum
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    AGENT = "AGENT"
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"
    CLAIMS_OFFICER = "CLAIMS_OFFICER"

class PolicyStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class ClaimStatus(str, enum.Enum):
    FILED = "FILED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class PolicyCategory(str, enum.Enum):
    Health = "Health"
    Auto = "Auto"
    Life = "Life"
    Home = "Home"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    customer_policies = relationship("Policy", foreign_keys="Policy.customer_id", back_populates="customer")
    agent_policies = relationship("Policy", foreign_keys="Policy.agent_id", back_populates="agent")
    claims = relationship("Claim", back_populates="customer")
    notifications = relationship("Notification", back_populates="user")

    @property
    def full_name(self):
        return self.name

    @full_name.setter
    def full_name(self, value):
        self.name = value

    @property
    def password_hash(self):
        return self.hashed_password

    @password_hash.setter
    def password_hash(self, value):
        self.hashed_password = value

class PolicyCatalog(Base):
    __tablename__ = "policy_catalogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(Enum(PolicyCategory), nullable=False)
    description = Column(Text, nullable=True)
    base_premium = Column(Float, nullable=False)
    coverage_amount = Column(Float, nullable=False)
    features = Column(Text, nullable=True)
    bestseller_tag = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    policies = relationship("Policy", back_populates="catalog")

    @property
    def type(self):
        return self.category.value if hasattr(self.category, 'value') else str(self.category)

    @property
    def premium(self):
        return self.base_premium

    @property
    def coverage(self):
        return self.coverage_amount

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    catalog_id = Column(Integer, ForeignKey("policy_catalogs.id"), nullable=True)
    
    title = Column(String(150), nullable=False)
    category = Column(Enum(PolicyCategory), nullable=False)
    premium_amount = Column(Float, nullable=False)
    coverage_amount = Column(Float, nullable=False)
    status = Column(Enum(PolicyStatus), default=PolicyStatus.ACTIVE, nullable=False)
    
    valid_from = Column(DateTime, default=datetime.datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)
    last_reminder_sent = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="customer_policies")
    agent = relationship("User", foreign_keys=[agent_id], back_populates="agent_policies")
    catalog = relationship("PolicyCatalog", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")

    @property
    def type(self):
        return self.category.value if hasattr(self.category, 'value') else str(self.category)

    @property
    def premium(self):
        return self.premium_amount

    @property
    def coverage(self):
        return self.coverage_amount

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(50), unique=True, index=True, nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    incident_date = Column(DateTime, nullable=False)
    amount_claimed = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.FILED, nullable=False)
    risk_score = Column(Float, default=0.0)
    document_name = Column(String(255), nullable=True)
    filed_at = Column(DateTime, default=datetime.datetime.utcnow)

    policy = relationship("Policy", back_populates="claims")
    customer = relationship("User", back_populates="claims")

    @property
    def amount(self):
        return self.amount_claimed

    @property
    def claim_date(self):
        return self.filed_at

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    channel = Column(String(20), default="IN_APP")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ClaimReview(Base):
    __tablename__ = "claim_reviews"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(Enum(ClaimStatus), nullable=False)
    remarks = Column(Text, nullable=True)
    review_date = Column(DateTime, default=datetime.datetime.utcnow)
    claim = relationship("Claim", backref="reviews")
    officer = relationship("User")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    uploaded_date = Column(DateTime, default=datetime.datetime.utcnow)
    claim = relationship("Claim", backref="documents")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    target_type = Column(String(100), nullable=True)
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    admin = relationship("User")

# Alias Policy to PolicyPurchase for legacy router queries
PolicyPurchase = Policy
