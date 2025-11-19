# Job Tracker Application - Architecture Documentation

## Overview
A full-stack job application tracker with a drag-and-drop Kanban board interface. Built with React frontend, FastAPI backend, and deployed with Docker.

## High-Level Architecture

```
┌─────────────────────────────────────┐
│      Docker Compose Network         │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  React   │  │ FastAPI  │        │
│  │ Frontend │◄─┤ Backend  │        │
│  │ (nginx)  │  │          │        │
│  └────┬─────┘  └────┬─────┘        │
│       │             │              │
│       │      ┌──────▼──────┐       │
│       │      │ PostgreSQL  │       │
│       │      │  Database   │       │
│       │      │  + Volume   │       │
│       │      └─────────────┘       │
│       │                            │
│  ┌────▼─────────────────────┐     │
│  │  Environment Variables   │     │
│  └──────────────────────────┘     │
└─────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query) for server state
- **Drag & Drop**: @dnd-kit/core
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios

**Decision Rationale:**
- TypeScript for type safety and better developer experience
- TanStack Query for efficient server state management and caching
- @dnd-kit/core chosen over react-beautiful-dnd for better performance, accessibility, and active maintenance
- Tailwind CSS for rapid UI development

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Server**: Uvicorn with Gunicorn
- **Database**: PostgreSQL 15

**Decision Rationale:**
- FastAPI for automatic API documentation, async support, and excellent TypeScript integration
- SQLAlchemy 2.0 for mature ORM with modern async support
- Pydantic for robust request/response validation
- PostgreSQL for reliability and JSONB support for flexible data

### Infrastructure
- **Containerization**: Docker
- **Deployment**: Docker Compose
- **Reverse Proxy**: nginx (for frontend static files)

## Data Model

### JobApplication Entity

```python
- id: UUID (primary key)
- company_name: String (required)
- position_title: String (required)
- status: Enum (Applied, Interviewing, Offer, Rejected)
- interview_stage: String (optional, e.g., "Phone Screen", "Technical Round 2")
- rejection_stage: String (optional, e.g., "After Phone Screen", "After Technical")
- application_date: DateTime (required)
- salary_range: String (optional, e.g., "$120k-$150k")
- location: String (optional)
- notes: Text (optional)
- order_index: Integer (for Kanban column ordering)
- created_at: DateTime (auto-generated)
- updated_at: DateTime (auto-updated)
```

**Status Flow:**
```
Applied → Interviewing → Offer
   ↓           ↓
Rejected ← Rejected
```

## API Design

### RESTful Endpoints

```
GET    /api/applications          # List all applications
POST   /api/applications          # Create new application
GET    /api/applications/{id}     # Get single application
PUT    /api/applications/{id}     # Update application
DELETE /api/applications/{id}     # Delete application
PATCH  /api/applications/{id}/move # Move to different status (optimized for drag-drop)
GET    /api/analytics             # Dashboard statistics
```

### Analytics Response Structure
```json
{
  "total_applications": 42,
  "by_status": {
    "Applied": 10,
    "Interviewing": 15,
    "Offer": 5,
    "Rejected": 12
  },
  "applications_over_time": [
    {"date": "2025-01", "count": 8},
    {"date": "2025-02", "count": 12}
  ],
  "average_time_per_stage": {
    "Applied": 3.5,
    "Interviewing": 14.2
  },
  "success_rate": 0.119
}
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── KanbanBoard/
│   │   ├── KanbanBoard.tsx        # Main board container
│   │   ├── KanbanColumn.tsx       # Single status column
│   │   └── JobCard.tsx            # Draggable job card
│   ├── JobForm/
│   │   ├── CreateJobModal.tsx     # Create new application
│   │   └── EditJobModal.tsx       # Edit existing
│   ├── Analytics/
│   │   └── Dashboard.tsx          # Charts and stats
│   └── common/
│       └── Layout.tsx             # App layout
├── hooks/
│   ├── useJobs.ts                 # React Query hooks
│   └── useAnalytics.ts
├── services/
│   └── api.ts                     # Axios API client
├── types/
│   └── job.ts                     # TypeScript interfaces
└── App.tsx
```

### State Management Strategy
- **Server State**: TanStack Query for API data, caching, and synchronization
- **UI State**: React useState/useReducer for local component state
- **Optimistic Updates**: Implemented on drag-drop for instant feedback

## Backend Architecture

### Directory Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── applications.py    # Job application endpoints
│   │   │   └── analytics.py       # Analytics endpoints
│   │   └── deps.py                # Dependencies (DB session, etc.)
│   ├── core/
│   │   ├── config.py              # Settings and configuration
│   │   └── database.py            # Database connection
│   ├── models/
│   │   └── job_application.py     # SQLAlchemy models
│   ├── schemas/
│   │   └── job_application.py     # Pydantic schemas
│   ├── services/
│   │   ├── job_service.py         # Business logic
│   │   └── analytics_service.py   # Analytics calculations
│   └── main.py                    # FastAPI app entry point
├── alembic/                       # Database migrations
├── tests/
└── requirements.txt
```

### Database Schema

```sql
CREATE TYPE status_enum AS ENUM ('Applied', 'Interviewing', 'Offer', 'Rejected');

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    status status_enum NOT NULL DEFAULT 'Applied',
    interview_stage VARCHAR(100),
    rejection_stage VARCHAR(100),
    application_date TIMESTAMP NOT NULL,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    notes TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_status ON job_applications(status);
CREATE INDEX idx_application_date ON job_applications(application_date);
```

## Docker Deployment

### Components

1. **Frontend Container**
   - nginx serving static React build
   - Exposed on port 3000 (mapped to internal port 80)
   - Health checks configured
   - Auto-restart enabled

2. **Backend Container**
   - FastAPI with Uvicorn server
   - Exposed on port 8000
   - Auto-reload for development
   - Runs database migrations on startup
   - Health checks via `/api/v1/health` endpoint
   - Auto-restart enabled

3. **Database Container**
   - PostgreSQL 15 Alpine
   - Exposed on port 5432
   - Persistent volume for data storage
   - Health checks via pg_isready
   - Auto-restart enabled

### Services & Networking
- All services connected via Docker Compose network (job-tracker-network)
- Frontend communicates with backend via internal DNS
- PostgreSQL accessible only within Docker network
- External access via mapped ports (3000, 8000, 5432)

### Data Persistence
- **postgres_data volume**: Persists database data across container restarts
- **Backend volume mount**: Enables live code reloading during development

## Development Workflow

### Local Development
```bash
# Using Docker Compose
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Database: localhost:5432
```

### Production Deployment
```bash
# Start all services in production mode
docker-compose up -d

# View service status and logs
docker-compose ps
docker-compose logs -f

# Stop services
docker-compose down

# Update and rebuild
docker-compose up -d --build
```

## Security Considerations

1. **CORS**: Configured in FastAPI for frontend origin
2. **Database Credentials**: Managed via environment variables (use .env files in production)
3. **Input Validation**: Pydantic schemas on all endpoints
4. **SQL Injection Prevention**: SQLAlchemy parameterized queries
5. **Rate Limiting**: Can be implemented with reverse proxy (nginx, Traefik)
6. **Environment Isolation**: Docker network isolation prevents direct database access from outside

## Scalability

### Horizontal Scaling Options
- Frontend: Stateless, can run multiple instances behind load balancer
- Backend: Stateless API, can be scaled with Docker Swarm or cloud services
- Database: Use managed PostgreSQL service (AWS RDS, Cloud SQL) with read replicas

### Performance Optimizations
- Database indexes on status and application_date
- React Query caching reduces API calls
- Optimistic updates for drag-drop
- nginx gzip compression for frontend assets
- Connection pooling in SQLAlchemy for efficient database access

### Scaling Strategies for Growth
1. **Docker Swarm**: Simple orchestration for modest scaling needs
2. **Cloud Container Services**: AWS ECS, Google Cloud Run for managed scaling
3. **Load Balancer**: Add nginx/Traefik load balancer for multiple backend instances
4. **Database Scaling**: Migrate to managed PostgreSQL with automated backups and scaling

## Future Enhancements

1. **Authentication**: Add user login with JWT
2. **Multi-user**: Support multiple users with role-based access
3. **Email Notifications**: Remind about follow-ups
4. **Resume Parsing**: Auto-extract job details from uploaded resumes
5. **Job Board Integration**: Import jobs from LinkedIn, Indeed
6. **Advanced Analytics**: ML-based success prediction
7. **Mobile App**: React Native version

## Monitoring & Observability

### Planned Metrics
- Application count by status
- API response times
- Database query performance
- Container CPU/Memory usage
- Docker container health status

### Logging
- FastAPI structured logging
- Docker container logs via `docker-compose logs`
- Centralized logging with ELK/Loki (future)
- Health check endpoints for monitoring services

## License
MIT
