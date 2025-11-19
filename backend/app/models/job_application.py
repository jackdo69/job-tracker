"""
Job Application database model.
"""
import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    """Job application status enum."""

    APPLIED = "Applied"
    INTERVIEWING = "Interviewing"
    OFFER = "Offer"
    REJECTED = "Rejected"


class JobApplication(Base):
    """Job Application model."""

    __tablename__ = "job_applications"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Required fields
    company_name = Column(String(255), nullable=False)
    position_title = Column(String(255), nullable=False)
    status = Column(
        Enum(ApplicationStatus, name="status_enum"),
        nullable=False,
        default=ApplicationStatus.APPLIED,
        index=True,
    )
    application_date = Column(DateTime, nullable=False, index=True)
    order_index = Column(Integer, nullable=False, default=0)

    # Optional fields
    interview_stage = Column(String(100), nullable=True)
    rejection_stage = Column(String(100), nullable=True)
    salary_range = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="job_applications")

    def __repr__(self):
        """String representation."""
        return f"<JobApplication {self.company_name} - {self.position_title}>"
