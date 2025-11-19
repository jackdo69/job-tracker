"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, LoginResponse
from app.services.auth_service import AuthService
from app.services.google_oauth_service import GoogleOAuthService
from app.core.config import settings
from urllib.parse import urlencode


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new user.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        Created user information

    Raises:
        HTTPException: If email already exists
    """
    auth_service = AuthService(db)
    return auth_service.register_user(user_data)


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate user and return access token.

    Args:
        login_data: Login credentials
        db: Database session

    Returns:
        Access token and user information

    Raises:
        HTTPException: If credentials are invalid
    """
    auth_service = AuthService(db)
    return auth_service.authenticate_user(login_data)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user information.

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        Current user information
    """
    return UserResponse.model_validate(current_user)


@router.get("/google/login")
def google_login():
    """
    Initiate Google OAuth login flow.

    Returns:
        Redirect to Google OAuth consent page
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured",
        )

    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }

    auth_url = f"{google_auth_url}?{urlencode(params)}"
    return {"auth_url": auth_url}


@router.get("/google/callback")
async def google_callback(
    code: str,
    db: Session = Depends(get_db),
):
    """
    Handle Google OAuth callback and redirect to frontend.

    Args:
        code: Authorization code from Google
        db: Database session

    Returns:
        Redirect to frontend with token

    Raises:
        HTTPException: If authentication fails
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured",
        )

    try:
        login_response = await GoogleOAuthService.authenticate_with_google(db, code)

        # Redirect to frontend with token
        frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
        redirect_url = f"{frontend_url}/auth/google/callback?token={login_response.access_token}"

        return RedirectResponse(url=redirect_url)
    except Exception as e:
        # Redirect to frontend with error
        frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
        redirect_url = f"{frontend_url}/login?error=google_auth_failed"
        return RedirectResponse(url=redirect_url)
