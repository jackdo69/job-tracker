"""
Business logic for job applications.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.job_application import JobApplication, ApplicationStatus
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationMove,
)


class JobApplicationService:
    """Service for job application operations."""

    @staticmethod
    def get_all(db: Session, user_id: UUID) -> List[JobApplication]:
        """
        Get all job applications for a specific user.

        Args:
            db: Database session
            user_id: User UUID to filter by

        Returns:
            List of job applications ordered by order_index
        """
        return (
            db.query(JobApplication)
            .filter(JobApplication.user_id == user_id)
            .order_by(JobApplication.status, JobApplication.order_index)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, application_id: UUID, user_id: UUID) -> Optional[JobApplication]:
        """
        Get job application by ID for a specific user.

        Args:
            db: Database session
            application_id: Application UUID
            user_id: User UUID to filter by

        Returns:
            Job application or None
        """
        return (
            db.query(JobApplication)
            .filter(JobApplication.id == application_id, JobApplication.user_id == user_id)
            .first()
        )

    @staticmethod
    def create(db: Session, application: JobApplicationCreate, user_id: UUID) -> JobApplication:
        """
        Create new job application for a specific user.

        Args:
            db: Database session
            application: Application data
            user_id: User UUID who owns this application

        Returns:
            Created job application
        """
        # Get max order_index for the status and user
        max_order = (
            db.query(JobApplication)
            .filter(
                JobApplication.status == application.status,
                JobApplication.user_id == user_id
            )
            .order_by(desc(JobApplication.order_index))
            .first()
        )

        order_index = (max_order.order_index + 1) if max_order else 0

        db_application = JobApplication(
            **application.model_dump(exclude={"order_index"}),
            user_id=user_id,
            order_index=order_index
        )
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        return db_application

    @staticmethod
    def update(
        db: Session, application_id: UUID, application: JobApplicationUpdate, user_id: UUID
    ) -> Optional[JobApplication]:
        """
        Update job application for a specific user.

        Args:
            db: Database session
            application_id: Application UUID
            application: Updated data
            user_id: User UUID to verify ownership

        Returns:
            Updated job application or None
        """
        db_application = JobApplicationService.get_by_id(db, application_id, user_id)
        if not db_application:
            return None

        update_data = application.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_application, field, value)

        db.commit()
        db.refresh(db_application)
        return db_application

    @staticmethod
    def delete(db: Session, application_id: UUID, user_id: UUID) -> bool:
        """
        Delete job application for a specific user.

        Args:
            db: Database session
            application_id: Application UUID
            user_id: User UUID to verify ownership

        Returns:
            True if deleted, False if not found
        """
        db_application = JobApplicationService.get_by_id(db, application_id, user_id)
        if not db_application:
            return False

        db.delete(db_application)
        db.commit()
        return True

    @staticmethod
    def move(
        db: Session, application_id: UUID, move_data: JobApplicationMove, user_id: UUID
    ) -> Optional[JobApplication]:
        """
        Move application to new status/position (for drag-drop) for a specific user.

        Args:
            db: Database session
            application_id: Application UUID
            move_data: New status and order
            user_id: User UUID to verify ownership

        Returns:
            Updated job application or None
        """
        db_application = JobApplicationService.get_by_id(db, application_id, user_id)
        if not db_application:
            return None

        old_status = db_application.status
        new_status = move_data.status

        # Update status and order
        db_application.status = new_status
        db_application.order_index = move_data.order_index

        # Update stage fields based on status
        if new_status == ApplicationStatus.INTERVIEWING:
            db_application.interview_stage = move_data.interview_stage
            db_application.rejection_stage = None
        elif new_status == ApplicationStatus.REJECTED:
            db_application.rejection_stage = move_data.rejection_stage
            db_application.interview_stage = None
        else:
            db_application.interview_stage = None
            db_application.rejection_stage = None

        # If status changed, reorder other applications (only for this user)
        if old_status != new_status:
            # Increment order_index for applications after the insertion point
            db.query(JobApplication).filter(
                JobApplication.user_id == user_id,
                JobApplication.status == new_status,
                JobApplication.order_index >= move_data.order_index,
                JobApplication.id != application_id,
            ).update(
                {JobApplication.order_index: JobApplication.order_index + 1},
                synchronize_session=False,
            )

        db.commit()
        db.refresh(db_application)
        return db_application

    @staticmethod
    def get_by_status(db: Session, status: ApplicationStatus, user_id: UUID) -> List[JobApplication]:
        """
        Get all applications with a specific status for a specific user.

        Args:
            db: Database session
            status: Application status
            user_id: User UUID to filter by

        Returns:
            List of applications
        """
        return (
            db.query(JobApplication)
            .filter(JobApplication.status == status, JobApplication.user_id == user_id)
            .order_by(JobApplication.order_index)
            .all()
        )
