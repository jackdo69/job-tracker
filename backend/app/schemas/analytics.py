"""
Pydantic schemas for Analytics API.
"""
from typing import Dict, List
from pydantic import BaseModel


class ApplicationsByStatus(BaseModel):
    """Count of applications by status."""

    Applied: int = 0
    Interviewing: int = 0
    Offer: int = 0
    Rejected: int = 0


class ApplicationsOverTime(BaseModel):
    """Applications count over time."""

    date: str  # Format: YYYY-MM
    count: int


class AverageTimePerStage(BaseModel):
    """Average days spent in each stage."""

    Applied: float = 0.0
    Interviewing: float = 0.0


class AnalyticsResponse(BaseModel):
    """Analytics dashboard response."""

    total_applications: int
    by_status: ApplicationsByStatus
    applications_over_time: List[ApplicationsOverTime]
    average_time_per_stage: AverageTimePerStage
    success_rate: float  # Offers / Total applications
