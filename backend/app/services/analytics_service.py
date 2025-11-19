"""
Business logic for analytics.
"""
from typing import Dict, List
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.job_application import JobApplication, ApplicationStatus
from app.schemas.analytics import (
    AnalyticsResponse,
    ApplicationsByStatus,
    ApplicationsOverTime,
    AverageTimePerStage,
)


class AnalyticsService:
    """Service for analytics operations."""

    @staticmethod
    def get_analytics(db: Session, user_id: UUID) -> AnalyticsResponse:
        """
        Get analytics data for dashboard for a specific user.

        Args:
            db: Database session
            user_id: User UUID to filter by

        Returns:
            Analytics response with all metrics
        """
        # Total applications for user
        total = db.query(JobApplication).filter(JobApplication.user_id == user_id).count()

        # Applications by status for user
        status_counts = (
            db.query(JobApplication.status, func.count(JobApplication.id))
            .filter(JobApplication.user_id == user_id)
            .group_by(JobApplication.status)
            .all()
        )

        by_status = ApplicationsByStatus()
        for status, count in status_counts:
            setattr(by_status, status.value, count)

        # Applications over time (by month) for user
        apps_over_time = (
            db.query(
                func.to_char(JobApplication.application_date, "YYYY-MM").label("month"),
                func.count(JobApplication.id).label("count"),
            )
            .filter(JobApplication.user_id == user_id)
            .group_by("month")
            .order_by("month")
            .all()
        )

        applications_over_time = [
            ApplicationsOverTime(date=month, count=count)
            for month, count in apps_over_time
        ]

        # Average time per stage (simplified calculation) for user
        avg_time = AnalyticsService._calculate_average_time_per_stage(db, user_id)

        # Success rate (offers / total)
        success_rate = (
            (by_status.Offer / total) if total > 0 else 0.0
        )

        return AnalyticsResponse(
            total_applications=total,
            by_status=by_status,
            applications_over_time=applications_over_time,
            average_time_per_stage=avg_time,
            success_rate=round(success_rate, 3),
        )

    @staticmethod
    def _calculate_average_time_per_stage(db: Session, user_id: UUID) -> AverageTimePerStage:
        """
        Calculate average time spent in each stage for a specific user.

        Note: This is a simplified calculation based on current status.
        For accurate tracking, you'd need to store status change history.

        Args:
            db: Database session
            user_id: User UUID to filter by

        Returns:
            Average time per stage
        """
        now = datetime.utcnow()

        # Average days in Applied status for user
        applied_apps = (
            db.query(JobApplication)
            .filter(
                JobApplication.status == ApplicationStatus.APPLIED,
                JobApplication.user_id == user_id
            )
            .all()
        )

        avg_applied = 0.0
        if applied_apps:
            total_days = sum(
                (now - app.application_date).days for app in applied_apps
            )
            avg_applied = total_days / len(applied_apps)

        # Average days in Interviewing status for user
        interviewing_apps = (
            db.query(JobApplication)
            .filter(
                JobApplication.status == ApplicationStatus.INTERVIEWING,
                JobApplication.user_id == user_id
            )
            .all()
        )

        avg_interviewing = 0.0
        if interviewing_apps:
            total_days = sum(
                (now - app.application_date).days for app in interviewing_apps
            )
            avg_interviewing = total_days / len(interviewing_apps)

        return AverageTimePerStage(
            Applied=round(avg_applied, 1),
            Interviewing=round(avg_interviewing, 1),
        )
