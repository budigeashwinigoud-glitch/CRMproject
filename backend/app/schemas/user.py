from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    full_name: str = Field(..., alias="fullName")
    email: EmailStr
    role: Optional[str] = "EMPLOYEE"  # "ADMIN" or "EMPLOYEE"
    is_active: Optional[bool] = Field(True, alias="isActive")

    class Config:
        populate_by_name = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, alias="fullName")
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = Field(None, alias="isActive")

    class Config:
        populate_by_name = True


class UserStatusUpdate(BaseModel):
    is_active: bool = Field(..., alias="isActive")

    class Config:
        populate_by_name = True


class UserResponse(BaseModel):
    id: int
    fullName: str
    email: EmailStr
    role: str
    isActive: bool
    createdAt: Optional[datetime] = None

    @classmethod
    def model_validate(cls, user):
        return cls(
            id=user.id,
            fullName=user.full_name,
            email=user.email,
            role=user.role,
            isActive=user.is_active,
            createdAt=user.created_at
        )

    class Config:
        from_attributes = True
