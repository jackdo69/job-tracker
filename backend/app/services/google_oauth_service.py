"""
Google OAuth service for authentication.
"""
from typing import Optional, Dict, Any
import httpx
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserResponse, LoginResponse
from app.core.security import create_access_token
from app.core.config import settings
from app.services.auth_service import AuthService


class GoogleOAuthService:
    """Service for Google OAuth operations."""

    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    @staticmethod
    async def exchange_code_for_token(code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from Google

        Returns:
            Token response from Google

        Raises:
            HTTPException: If token exchange fails
        """
        token_url = "https://oauth2.googleapis.com/token"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                token_url,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange authorization code",
                )

            return response.json()

    @staticmethod
    async def get_user_info(access_token: str) -> Dict[str, Any]:
        """
        Get user information from Google.

        Args:
            access_token: Google access token

        Returns:
            User information from Google

        Raises:
            HTTPException: If fetching user info fails
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GoogleOAuthService.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to fetch user information",
                )

            return response.json()

    @staticmethod
    def get_or_create_user(db: Session, user_info: Dict[str, Any]) -> User:
        """
        Get existing user or create new user from Google user info.

        Args:
            db: Database session
            user_info: User information from Google

        Returns:
            User object

        Raises:
            HTTPException: If user creation fails
        """
        email = user_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google",
            )

        # Check if user already exists
        auth_service = AuthService(db)
        existing_user = auth_service.get_user_by_email(email)

        if existing_user:
            return existing_user

        # Create new user
        full_name = user_info.get("name")

        # For OAuth users, we don't store a password
        # Set a random unusable password (limited to 72 bytes for bcrypt)
        import secrets
        unusable_password = secrets.token_urlsafe(48)[:72]  # Limit to 72 bytes

        from app.core.security import get_password_hash
        hashed_password = get_password_hash(unusable_password)

        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_active=True,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    @staticmethod
    async def authenticate_with_google(db: Session, code: str) -> LoginResponse:
        """
        Authenticate user with Google OAuth.

        Args:
            db: Database session
            code: Authorization code from Google

        Returns:
            Login response with JWT token and user info

        Raises:
            HTTPException: If authentication fails
        """
        # Exchange code for token
        token_response = await GoogleOAuthService.exchange_code_for_token(code)
        access_token = token_response.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received from Google",
            )

        # Get user info from Google
        user_info = await GoogleOAuthService.get_user_info(access_token)

        # Get or create user in our database
        user = GoogleOAuthService.get_or_create_user(db, user_info)

        # Create JWT token for our app
        jwt_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return LoginResponse(
            access_token=jwt_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
