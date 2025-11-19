# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Job Tracker is a full-stack job application tracking system with a Kanban board interface. The application uses React + TypeScript frontend with FastAPI + Python backend, deployed with Docker.

**Key Features:**
- Drag-and-drop Kanban board for managing job applications across status columns (Applied → Interviewing → Offer/Rejected)
- Analytics dashboard with visualizations
- RESTful API with automatic OpenAPI documentation
- PostgreSQL database with SQLAlchemy 2.0 ORM

## Development Commands

### Local Development with Docker Compose

```bash
# Start all services (recommended for development)
docker-compose up

# Rebuild after dependency changes
docker-compose up --build

# Stop services
docker-compose down
```

**Service URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/v1/docs
- Database: localhost:5432

### Backend Development

```bash
cd backend

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Code quality
black .                # Format code
flake8 .              # Lint
mypy .                # Type checking
```

### Database Migrations

```bash
cd backend

# Create new migration after model changes
alembic revision --autogenerate -m "description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Code quality
npm run lint          # ESLint
npm run format        # Prettier
npm run type-check    # TypeScript type checking
```

### Docker Deployment

```bash
# Start all services in production mode
docker-compose up -d

# Build and start with latest changes
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

## Architecture

### Backend Structure

The backend follows a clean architecture pattern with clear separation of concerns:

```
backend/app/
├── api/
│   ├── endpoints/
│   │   ├── applications.py   # Job application CRUD endpoints
│   │   └── analytics.py       # Analytics/dashboard endpoints
│   └── deps.py                # Dependency injection (DB sessions)
├── core/
│   ├── config.py              # Settings (DATABASE_URL, CORS_ORIGINS, etc.)
│   └── database.py            # SQLAlchemy engine and session
├── models/
│   └── job_application.py     # SQLAlchemy ORM models
├── schemas/
│   ├── job_application.py     # Pydantic schemas for validation
│   └── analytics.py           # Analytics response schemas
├── services/
│   ├── job_service.py         # Business logic for job applications
│   └── analytics_service.py   # Analytics calculations
└── main.py                    # FastAPI app initialization
```

**Key Patterns:**
- **Separation of Concerns**: API endpoints → Services → Models
- **Dependency Injection**: Database sessions injected via `deps.py`
- **Pydantic Schemas**: Separate schemas for Create, Update, and Response
- **Service Layer**: All business logic lives in `services/`, not endpoints

### Frontend Structure

```
frontend/src/
├── components/
│   ├── KanbanBoard/          # Drag-and-drop Kanban implementation
│   ├── JobForm/              # Create/Edit job modals
│   ├── Analytics/            # Dashboard with charts
│   └── common/               # Shared components (Layout, etc.)
├── hooks/
│   ├── useJobs.ts            # React Query hooks for job CRUD
│   └── useAnalytics.ts       # React Query hooks for analytics
├── services/
│   └── api.ts                # Axios client and API functions
├── types/
│   └── job.ts                # TypeScript interfaces
└── App.tsx                   # Main app with routing
```

**Key Patterns:**
- **TanStack Query**: All server state managed via React Query (not Redux/Zustand)
- **Optimistic Updates**: Drag-drop uses optimistic updates for instant UI feedback
- **@dnd-kit/core**: Modern drag-and-drop library (not react-beautiful-dnd)
- **Tailwind CSS**: Utility-first styling (no component library like MUI)

### Data Model

**JobApplication** is the core entity:

```typescript
{
  id: UUID
  company_name: string
  position_title: string
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected'
  interview_stage?: string      // e.g., "Phone Screen", "Technical Round 2"
  rejection_stage?: string      // e.g., "After Phone Screen"
  application_date: Date
  salary_range?: string
  location?: string
  notes?: string
  order_index: number           // For Kanban column ordering
  created_at: Date
  updated_at: Date
}
```

**Important Details:**
- Single `status` enum with optional `interview_stage`/`rejection_stage` fields for sub-states
- `order_index` maintains card order within each Kanban column (independent ordering per status)
- Database has indexes on `status` and `application_date` for performance

### API Endpoints

All endpoints are prefixed with `/api/v1`:

```
GET    /api/v1/applications              # List all applications
POST   /api/v1/applications              # Create new application
GET    /api/v1/applications/{id}         # Get single application
PUT    /api/v1/applications/{id}         # Update application
DELETE /api/v1/applications/{id}         # Delete application
PATCH  /api/v1/applications/{id}/move    # Move to new status (optimized for drag-drop)
GET    /api/v1/analytics                 # Get dashboard statistics
GET    /api/v1/health                    # Health check
```

**Special Endpoint:** The `/move` endpoint is optimized for drag-drop operations. It only requires:
```json
{
  "status": "Interviewing",
  "order_index": 3,
  "interview_stage": "Technical Round 1"  // optional
}
```

### State Management

- **Server State**: TanStack Query manages all API data with automatic caching and invalidation
- **UI State**: Local React state (useState/useReducer) for modals, forms, etc.
- **Optimistic Updates**: Drag-drop operations update UI immediately, then sync with server
- **No Global State Store**: No Redux/Zustand/Recoil - React Query handles server state, local state for everything else

### Environment Variables

**Backend** (.env):
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobtracker
CORS_ORIGINS=http://localhost:3000,http://localhost
```

**Frontend** (.env):
```bash
VITE_API_URL=http://localhost:8000
```

Note: Frontend uses Vite (not Create React App), so environment variables are prefixed with `VITE_`.

## Important Implementation Notes

### When Working with the Kanban Board

- Drag-drop uses `@dnd-kit/core` with `@dnd-kit/sortable` for column ordering
- Each status column has independent `order_index` values (0, 1, 2, ...)
- Use the `/move` endpoint for drag-drop operations (more efficient than full PUT)
- Optimistic updates are implemented in the frontend hooks

### When Working with the Database

- Always use Alembic for schema changes (never modify models and run directly)
- Run `alembic revision --autogenerate` after model changes
- The database connection uses SQLAlchemy 2.0 async patterns
- Session management is handled via dependency injection in `api/deps.py`

### When Adding New Features

1. **Backend**: Create model → Create schema → Create service → Create endpoint
2. **Frontend**: Define TypeScript types → Create API function → Create React Query hook → Build component
3. **Database**: Always create migration with `alembic revision --autogenerate`

### Testing

- Backend tests use pytest with async support (`pytest-asyncio`)
- Use `httpx.AsyncClient` for testing FastAPI endpoints
- Frontend tests would use React Testing Library (not currently implemented)

## Common Development Scenarios

### Adding a New Field to JobApplication

1. Update `backend/app/models/job_application.py` with new field
2. Update `backend/app/schemas/job_application.py` schemas
3. Create migration: `cd backend && alembic revision --autogenerate -m "add new field"`
4. Apply migration: `alembic upgrade head`
5. Update frontend `types/job.ts` interface
6. Update relevant components/forms

### Adding a New API Endpoint

1. Create function in appropriate service (`backend/app/services/`)
2. Add endpoint in `backend/app/api/endpoints/`
3. Include router in `backend/app/main.py` if new router
4. Create corresponding API function in `frontend/src/services/api.ts`
5. Create React Query hook in `frontend/src/hooks/`

### Debugging

- Backend: Check `http://localhost:8000/api/v1/docs` for interactive API testing
- Frontend: Use React Query DevTools (already installed)
- Database: Use `docker exec -it job-tracker-db psql -U postgres -d jobtracker`
- Logs: `docker-compose logs -f backend` or `docker-compose logs -f frontend`

## Technical Decisions Reference

Key architectural decisions (see docs/TECHNICAL_DECISIONS.md for details):

- **@dnd-kit/core** chosen over react-beautiful-dnd for better performance and active maintenance
- **TanStack Query** for server state instead of Redux (purpose-built for API data)
- **SQLAlchemy 2.0** with async support
- **Tailwind CSS** for styling (no component library)
- **Dedicated `/move` endpoint** for efficient drag-drop updates
- **Single status enum + stage fields** instead of nested state tables
- **No authentication in v1** - designed to add later with user_id foreign key

## Project Goals

This project was built to:
1. Learn Python backend development with FastAPI
2. Learn Docker containerization and deployment
3. Build a practical tool for tracking job applications
4. Implement modern frontend patterns (React Query, dnd-kit)
