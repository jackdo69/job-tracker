"""
Pydantic schemas for Job Application API.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.job_application import ApplicationStatus


# Shared properties
class JobApplicationBase(BaseModel):
    """Base schema for job application."""

    company_name: str = Field(..., min_length=1, max_length=255)
    position_title: str = Field(..., min_length=1, max_length=255)
    status: ApplicationStatus = ApplicationStatus.APPLIED
    interview_stage: Optional[str] = Field(None, max_length=100)
    rejection_stage: Optional[str] = Field(None, max_length=100)
    application_date: datetime
    salary_range: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    order_index: int = Field(default=0, ge=0)


# Properties to receive on creation
class JobApplicationCreate(JobApplicationBase):
    """Schema for creating a job application."""

    pass


# Properties to receive on update
class JobApplicationUpdate(BaseModel):
    """Schema for updating a job application."""

    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    position_title: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[ApplicationStatus] = None
    interview_stage: Optional[str] = Field(None, max_length=100)
    rejection_stage: Optional[str] = Field(None, max_length=100)
    application_date: Optional[datetime] = None
    salary_range: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)


# Properties for moving application (drag-drop)
class JobApplicationMove(BaseModel):
    """Schema for moving a job application to a new status."""

    status: ApplicationStatus
    order_index: int = Field(..., ge=0)
    interview_stage: Optional[str] = Field(None, max_length=100)
    rejection_stage: Optional[str] = Field(None, max_length=100)


# Properties shared by models stored in DB
class JobApplicationInDBBase(JobApplicationBase):
    """Base schema for job application in database."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Properties to return to client
class JobApplication(JobApplicationInDBBase):
    """Schema for job application response."""

    pass


# Properties stored in DB
class JobApplicationInDB(JobApplicationInDBBase):
    """Schema for job application in database."""

    pass
