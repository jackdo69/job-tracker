# Setup Guide

This guide will walk you through setting up the Job Tracker application locally and deploying it with Docker.

## Prerequisites

### Required
- **Docker** and **Docker Compose**
- **Git**

### Optional (for local development without Docker)
- **Node.js 18+** and **npm**
- **Python 3.11+** and **pip**
- **PostgreSQL 15+**

## Quick Start with Docker Compose

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository (if not already done)
cd job-tracker

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

**Stop services:**
```bash
docker-compose down

# To remove volumes as well (deletes data)
docker-compose down -v
```

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and configure DATABASE_URL
```

5. **Start PostgreSQL** (if not using Docker):
```bash
# Using Docker for just the database
docker run --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jobtracker \
  -p 5432:5432 \
  -d postgres:15-alpine
```

6. **Run database migrations:**
```bash
alembic upgrade head
```

7. **Start development server:**
```bash
uvicorn app.main:app --reload --port 8000
```

**Backend is now running at:** http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env if needed (default: VITE_API_URL=http://localhost:8000)
```

4. **Start development server:**
```bash
npm run dev
```

**Frontend is now running at:** http://localhost:3000

## Production Deployment with Docker

### Build and Deploy

```bash
# Start all services in production mode (detached)
docker-compose up -d

# Build images from scratch
docker-compose build --no-cache

# View service status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/v1/docs

### Updating After Code Changes

```bash
# Rebuild and restart services
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

## Database Migrations

### Create a new migration

```bash
cd backend

# Auto-generate migration from model changes
alembic revision --autogenerate -m "description of changes"

# Create empty migration
alembic revision -m "description of changes"
```

### Apply migrations

```bash
# Upgrade to latest
alembic upgrade head

# Upgrade to specific revision
alembic upgrade <revision_id>

# Downgrade one step
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

### In Docker

```bash
# Run migrations in Docker container
docker-compose exec backend alembic upgrade head

# Create new migration in Docker
docker-compose exec backend alembic revision --autogenerate -m "description"
```

## Troubleshooting

### Docker Compose Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

**Database connection errors:**
```bash
# Ensure PostgreSQL is healthy
docker-compose ps
docker-compose logs postgres

# Restart services
docker-compose restart backend
```

### Frontend Issues

**API calls failing:**
- Check CORS configuration in backend
- Verify API URL in frontend environment variables
- Check browser console for errors

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Backend Issues

**Import errors:**
```bash
# Ensure you're in virtual environment
which python  # Should point to venv

# Reinstall dependencies
pip install -r requirements.txt
```

**Migration errors:**
```bash
# Reset migrations (WARNING: loses data)
alembic downgrade base
alembic upgrade head

# Check current revision
alembic current

# Show history
alembic history
```

## Development Workflow

### Making Changes

1. **Update backend code:**
   - Modify files in `backend/app/`
   - Create migrations if models changed
   - Test locally with `uvicorn app.main:app --reload`

2. **Update frontend code:**
   - Modify files in `frontend/src/`
   - Test locally with `npm run dev`

3. **Rebuild and restart Docker containers:**
   ```bash
   # Rebuild all services
   docker-compose up -d --build

   # Or rebuild specific service
   docker-compose build backend
   docker-compose up -d backend
   ```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Linting
cd backend && flake8 .
cd frontend && npm run lint
```

## Production Considerations

Before deploying to production:

1. **Update Secrets:**
   - Change database password in docker-compose.yml or use environment files
   - Use environment variables for sensitive data
   - Consider external secret managers (AWS Secrets Manager, HashiCorp Vault)

2. **Database:**
   - Use managed PostgreSQL (AWS RDS, Google Cloud SQL, DigitalOcean Databases)
   - Set up automated backups
   - Update DATABASE_URL in environment variables
   - Remove volume mounts from docker-compose for production database

3. **TLS/HTTPS:**
   - Set up reverse proxy (nginx, Traefik) with Let's Encrypt
   - Configure SSL certificates
   - Update CORS_ORIGINS to include production domain

4. **Monitoring:**
   - Set up logging and monitoring (Datadog, New Relic, self-hosted Prometheus/Grafana)
   - Configure log aggregation
   - Set up health check alerts

5. **Resource Limits:**
   - Configure Docker container resource limits
   - Set memory and CPU constraints in docker-compose.yml
   - Monitor resource usage

6. **CI/CD:**
   - Set up automated builds and tests (GitHub Actions, GitLab CI)
   - Configure deployment pipelines
   - Implement automated Docker image builds

7. **Scaling:**
   - Use Docker Swarm for container orchestration if needed
   - Consider cloud container services (AWS ECS, Google Cloud Run) for horizontal scaling

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- Review [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) for technical choices
- Check the main [README.md](../README.md) for project overview

## Getting Help

- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the API documentation at `/api/docs` when running
- Read the inline code comments for implementation details
