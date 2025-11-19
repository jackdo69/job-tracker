"""
API endpoints for job applications.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.job_application import (
    JobApplication,
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationMove,
)
from app.services.job_service import JobApplicationService

router = APIRouter()


@router.get("/", response_model=List[JobApplication])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all job applications for the current user.

    Returns:
        List of all job applications for current user
    """
    return JobApplicationService.get_all(db, current_user.id)


@router.post("/", response_model=JobApplication, status_code=status.HTTP_201_CREATED)
def create_application(
    application: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new job application for the current user.

    Args:
        application: Job application data

    Returns:
        Created job application
    """
    return JobApplicationService.create(db, application, current_user.id)


@router.get("/{application_id}", response_model=JobApplication)
def get_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single job application by ID for the current user.

    Args:
        application_id: Application UUID

    Returns:
        Job application

    Raises:
        HTTPException: If application not found or doesn't belong to user
    """
    application = JobApplicationService.get_by_id(db, application_id, current_user.id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {application_id} not found",
        )
    return application


@router.put("/{application_id}", response_model=JobApplication)
def update_application(
    application_id: UUID,
    application: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a job application for the current user.

    Args:
        application_id: Application UUID
        application: Updated data

    Returns:
        Updated job application

    Raises:
        HTTPException: If application not found or doesn't belong to user
    """
    updated = JobApplicationService.update(db, application_id, application, current_user.id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {application_id} not found",
        )
    return updated


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a job application for the current user.

    Args:
        application_id: Application UUID

    Raises:
        HTTPException: If application not found or doesn't belong to user
    """
    deleted = JobApplicationService.delete(db, application_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {application_id} not found",
        )


@router.patch("/{application_id}/move", response_model=JobApplication)
def move_application(
    application_id: UUID,
    move_data: JobApplicationMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Move application to a new status (for drag-drop) for the current user.

    Args:
        application_id: Application UUID
        move_data: New status and position

    Returns:
        Updated job application

    Raises:
        HTTPException: If application not found or doesn't belong to user
    """
    moved = JobApplicationService.move(db, application_id, move_data, current_user.id)
    if not moved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {application_id} not found",
        )
    return moved
