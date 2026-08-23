import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Policybazaar Insurance Management System"
    SECRET_KEY: str = "SUPER_SECRET_JWT_KEY_INSURANCE_AGENT_PORTAL_2026_POLICYBAZAAR"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./insurance_app.db"
    
    # SMTP Email Settings (With sensible defaults / fallback)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "notifications@insure.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "secretpassword")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "support@insure.com")
    EMAILS_FROM_NAME: str = "Policybazaar Insurance Desk"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
