"""
API endpoints for analytics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get analytics data for dashboard for the current user.

    Returns:
        Analytics data including totals, status breakdown, and trends for current user
    """
    return AnalyticsService.get_analytics(db, current_user.id)
