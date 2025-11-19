"""Pydantic schemas."""
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserInDB,
    Token,
    TokenData,
    LoginRequest,
    LoginResponse,
)
from .job_application import (
    JobApplicationBase,
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationMove,
    JobApplication,
)
from .analytics import AnalyticsResponse

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserInDB",
    "Token",
    "TokenData",
    "LoginRequest",
    "LoginResponse",
    # Job application schemas
    "JobApplicationBase",
    "JobApplicationCreate",
    "JobApplicationUpdate",
    "JobApplicationMove",
    "JobApplication",
    # Analytics schemas
    "AnalyticsResponse",
]
