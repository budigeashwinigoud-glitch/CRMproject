import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Belvo Internal CRM & AI Lead Management System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "belvo-crm-super-secure-jwt-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite default, easily overridden by postgresql:// in .env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    
    # CORS Origins (allow frontend dev and preview servers)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5176",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Initial Admin Seed Config
    INITIAL_ADMIN_EMAIL: str = os.getenv("INITIAL_ADMIN_EMAIL", "admin@belvo.com")
    INITIAL_ADMIN_PASSWORD: str = os.getenv("INITIAL_ADMIN_PASSWORD", "Admin@12345")
    INITIAL_ADMIN_NAME: str = os.getenv("INITIAL_ADMIN_NAME", "CRM Administrator")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
