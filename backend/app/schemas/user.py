"""
User and authentication Pydantic schemas.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# User schemas
class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user (registration)."""

    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserUpdate(BaseModel):
    """Schema for updating user information."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class UserResponse(UserBase):
    """Schema for user response (excludes password)."""

    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Schema for user in database (includes hashed password)."""

    hashed_password: str

    class Config:
        from_attributes = True


# Authentication schemas
class Token(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for data encoded in JWT token."""

    user_id: Optional[UUID] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Schema for login response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
