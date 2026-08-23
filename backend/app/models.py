import enum
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    AGENT = "AGENT"
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"

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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    customer_policies = relationship("Policy", foreign_keys="Policy.customer_id", back_populates="customer")
    agent_policies = relationship("Policy", foreign_keys="Policy.agent_id", back_populates="agent")
    claims = relationship("Claim", back_populates="customer")
    notifications = relationship("Notification", back_populates="user")

class PolicyCatalog(Base):
    __tablename__ = "policy_catalogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(Enum(PolicyCategory), nullable=False)
    description = Column(Text, nullable=True)
    base_premium = Column(Float, nullable=False)
    coverage_amount = Column(Float, nullable=False)
    features = Column(Text, nullable=True) # JSON or comma-separated string
    bestseller_tag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    policies = relationship("Policy", back_populates="catalog")

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
    risk_score = Column(Float, default=0.0) # Calculated by risk_engine
    document_name = Column(String(255), nullable=True)
    filed_at = Column(DateTime, default=datetime.datetime.utcnow)

    policy = relationship("Policy", back_populates="claims")
    customer = relationship("User", back_populates="claims")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    channel = Column(String(20), default="IN_APP") # IN_APP, EMAIL, SMS
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False) # REGISTER, FORGOT_PASSWORD
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
