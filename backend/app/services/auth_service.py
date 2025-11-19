"""
Authentication service for user registration and login.
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, LoginResponse
from app.core.security import verify_password, get_password_hash, create_access_token


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get a user by email address.

        Args:
            email: The user's email address

        Returns:
            User object if found, None otherwise
        """
        stmt = select(User).where(User.email == email)
        result = self.db.execute(stmt)
        return result.scalar_one_or_none()

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Get a user by ID.

        Args:
            user_id: The user's UUID

        Returns:
            User object if found, None otherwise
        """
        stmt = select(User).where(User.id == user_id)
        result = self.db.execute(stmt)
        return result.scalar_one_or_none()

    def register_user(self, user_data: UserCreate) -> UserResponse:
        """
        Register a new user.

        Args:
            user_data: User registration data

        Returns:
            The created user

        Raises:
            HTTPException: If email already exists
        """
        # Check if user already exists
        existing_user = self.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            is_active=True,
        )

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        return UserResponse.model_validate(db_user)

    def authenticate_user(self, login_data: LoginRequest) -> LoginResponse:
        """
        Authenticate a user and return access token.

        Args:
            login_data: Login credentials

        Returns:
            Login response with access token and user data

        Raises:
            HTTPException: If credentials are invalid
        """
        # Get user by email
        user = self.get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account",
            )

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    def get_current_user_from_token(self, user_id: UUID) -> User:
        """
        Get current user from token payload.

        Args:
            user_id: User ID from JWT token

        Returns:
            User object

        Raises:
            HTTPException: If user not found or inactive
        """
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account",
            )

        return user
