"""
Main FastAPI application.
"""
import logging
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.api.endpoints import applications, analytics, auth
from app.api.deps import get_db
import os

# Configure logging
import sys
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout  # Use stdout instead of stderr so Railway shows correct log levels
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
logger.info(f"API prefix: {settings.API_V1_STR}")
logger.info(f"CORS origins: {settings.CORS_ORIGINS}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"],
)
app.include_router(
    applications.router,
    prefix=f"{settings.API_V1_STR}/applications",
    tags=["applications"],
)
app.include_router(
    analytics.router,
    prefix=f"{settings.API_V1_STR}/analytics",
    tags=["analytics"],
)


@app.get("/")
def root():
    """Root endpoint."""
    logger.info("Root endpoint accessed")
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    """Health check endpoint."""
    logger.debug("API health check accessed")
    return {"status": "healthy", "service": "job-tracker-api"}


@app.get("/health")
def health_check_root():
    """Root health check endpoint (for Railway)."""
    # Simple health check that doesn't depend on database
    # This prevents Railway from killing the container if DB is slow
    logger.info("Health check requested")
    return {
        "status": "healthy",
        "service": "job-tracker-api",
        "version": settings.VERSION
    }


@app.get("/health/db")
def health_check_database(db: Session = Depends(get_db)):
    """Database health check endpoint."""
    # Detailed health check that verifies database connectivity
    logger.info("Database health check requested")

    try:
        # Test database connection with a simple query
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        logger.info("Database health check passed")
        return {
            "status": "healthy",
            "service": "job-tracker-api",
            "version": settings.VERSION,
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )


@app.on_event("startup")
async def startup_event():
    """Log startup event."""
    logger.info("="*50)
    logger.info("Application startup complete!")
    logger.info(f"Service: {settings.PROJECT_NAME}")
    logger.info(f"Version: {settings.VERSION}")
    logger.info(f"Docs: {settings.API_V1_STR}/docs")
    logger.info(f"PORT: {os.getenv('PORT', '8000')}")
    logger.info(f"DATABASE_URL: {'SET' if os.getenv('DATABASE_URL') else 'NOT SET'}")
    logger.info("="*50)


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown event."""
    logger.warning("="*50)
    logger.warning("Application is shutting down!")
    logger.warning("If this happens unexpectedly, check Railway logs for crash details")
    logger.warning("="*50)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
