import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CUSTOMER = "CUSTOMER"
    AGENT = "AGENT"
    CLAIMS_OFFICER = "CLAIMS_OFFICER"

class PolicyStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"
    PENDING = "PENDING"

class ClaimStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DOCUMENTS_REQUIRED = "DOCUMENTS_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class DocType(str, enum.Enum):
    IDENTITY_PROOF = "IDENTITY_PROOF"
    INCIDENT_REPORT = "INCIDENT_REPORT"
    RECEIPT = "RECEIPT"
    PROPERTY_PHOTO = "PROPERTY_PHOTO"
    OTHER = "OTHER"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    customer_policies = relationship("Policy", foreign_keys="Policy.customer_id", back_populates="customer")
    agent_policies = relationship("Policy", foreign_keys="Policy.agent_id", back_populates="agent")
    claims = relationship("Claim", back_populates="customer")
    reviews = relationship("Review", back_populates="officer")
    notifications = relationship("Notification", back_populates="user")

class PolicyCatalog(Base):
    __tablename__ = "policy_catalog"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False) # e.g. POL-HLTH-101
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # Health, Auto, Home, Life
    description = Column(Text, nullable=False)
    base_premium = Column(Float, nullable=False)
    max_coverage = Column(Float, nullable=False)
    term_months = Column(Integer, default=12)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

    policies = relationship("Policy", back_populates="catalog")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String, unique=True, index=True, nullable=False) # POL-2026-XXXX
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    coverage_amount = Column(Float, nullable=False)
    premium = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(PolicyStatus), default=PolicyStatus.ACTIVE, nullable=False)

    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    catalog_id = Column(Integer, ForeignKey("policy_catalog.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], back_populates="customer_policies")
    agent = relationship("User", foreign_keys=[agent_id], back_populates="agent_policies")
    catalog = relationship("PolicyCatalog", back_populates="policies")
    claims = relationship("Claim", back_populates="policy", cascade="all, delete-orphan")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String, unique=True, index=True, nullable=False) # CLM-2026-XXXX
    reason = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    incident_date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.SUBMITTED, nullable=False)

    # Risk Scoring & Fraud Flags
    risk_score = Column(Integer, default=0) # 0 to 100
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH
    fraud_flags = Column(Text, default="[]") # JSON string list

    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    policy = relationship("Policy", back_populates="claims")
    customer = relationship("User", back_populates="claims")
    documents = relationship("Document", back_populates="claim", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="claim", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    doc_type = Column(SQLEnum(DocType), default=DocType.OTHER, nullable=False)
    status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    notes = Column(String, nullable=True)

    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.now)

    claim = relationship("Claim", back_populates="documents")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    decision = Column(SQLEnum(ClaimStatus), nullable=False)
    remarks = Column(Text, nullable=False)

    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    reviewed_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="reviews")
    officer = relationship("User", back_populates="reviews")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="SYSTEM") # CLAIM_UPDATE, EXPIRY_WARNING, SYSTEM
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
