"""
Application configuration settings.
"""
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, field_validator


class Settings(BaseSettings):
    """Application settings."""

    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Job Tracker API"
    VERSION: str = "1.0.0"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    # Database
    DATABASE_URL: PostgresDsn = "postgresql://postgres:postgres@localhost:5432/jobtracker"

    # Authentication / Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"  # Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""  # Set in .env
    GOOGLE_CLIENT_SECRET: str = ""  # Set in .env
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000  # Railway provides PORT env var, which will override this default

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
