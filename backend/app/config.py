import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import model_validator


DEFAULT_DEV_SECRET = "belvo-crm-super-secure-jwt-secret-key-change-in-production-2026"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Belvo Internal CRM & AI Lead Management System"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # "development", "testing", "production"
    
    SECRET_KEY: str = os.getenv("JWT_SECRET", DEFAULT_DEV_SECRET)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite default, easily overridden by postgresql:// in .env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    
    # CORS Origins (allow frontend dev and preview servers, or comma-separated env var in deployment)
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",") if origin.strip()
    ]
    
    # Initial Admin Seed Config (development only)
    INITIAL_ADMIN_EMAIL: str = os.getenv("INITIAL_ADMIN_EMAIL", "admin@belvo.com")
    INITIAL_ADMIN_PASSWORD: str = os.getenv("INITIAL_ADMIN_PASSWORD", "Admin@12345")
    INITIAL_ADMIN_NAME: str = os.getenv("INITIAL_ADMIN_NAME", "CRM Administrator")

    # Third-Party Webhook Credentials
    META_APP_SECRET: Optional[str] = os.getenv("META_APP_SECRET", "belvo_meta_app_secret_test")
    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "belvo-crm-wa-verify-token-2026")
    WHATSAPP_APP_SECRET: Optional[str] = os.getenv("WHATSAPP_APP_SECRET", None)
    WEBSITE_WEBHOOK_SECRET: Optional[str] = os.getenv("WEBSITE_WEBHOOK_SECRET", None)

    # External Provider Live Status Configuration
    GOOGLE_CALENDAR_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CALENDAR_CLIENT_ID", None)
    MICROSOFT_GRAPH_CLIENT_ID: Optional[str] = os.getenv("MICROSOFT_GRAPH_CLIENT_ID", None)

    # AI / LLM Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    @model_validator(mode="after")
    def validate_production_security(self):
        env = (self.ENVIRONMENT or "development").lower()
        if env == "production":
            if not self.SECRET_KEY or self.SECRET_KEY == DEFAULT_DEV_SECRET or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "CRITICAL PRODUCTION ERROR: Unsafe or default JWT_SECRET detected. "
                    "Production requires a custom, high-entropy secret key of at least 32 characters."
                )
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
