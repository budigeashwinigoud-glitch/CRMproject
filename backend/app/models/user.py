from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="EMPLOYEE", nullable=False)  # "ADMIN" or "EMPLOYEE"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    leads = relationship("Lead", back_populates="assigned_user", foreign_keys="Lead.assigned_user_id")
    follow_ups = relationship("FollowUp", back_populates="assigned_user", foreign_keys="FollowUp.assigned_user_id")
