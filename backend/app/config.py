import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "InsurCare Insurance Management System"
    SECRET_KEY: str = "SUPER_SECRET_JWT_KEY_INSURANCE_AGENT_PORTAL_2026_INSURCARE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./insurance_app.db"
    
    # SMTP Email Settings for Live OTP & Policy Renewal Notifications
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "harshithcheripally16@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "mhgmcuiaivhsvmri")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "harshithcheripally16@gmail.com")
    EMAILS_FROM_NAME: str = "InsurCare Insurance Desk"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
