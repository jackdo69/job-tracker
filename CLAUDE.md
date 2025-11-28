# Job Tracker - Project Context

This file provides high-level guidance to Claude Code when working with the Job Tracker repository.

## Project Overview

Job Tracker is a full-stack job application tracking system with a Kanban board interface. The application uses React + TypeScript frontend with Node.js + TypeScript backend, deployed on modern cloud platforms.

**Key Features:**
- Drag-and-drop Kanban board for managing job applications across status columns (Applied → Interviewing → Offer/Rejected)
- Analytics dashboard with interactive charts and statistics
- JWT-based authentication with email/password and Google OAuth
- RESTful API with type-safe validation
- PostgreSQL database with modern ORM

## Tech Stack Summary

### Backend
- **Node.js 22 + TypeScript** - Runtime and language
- **Hono** - Fast web framework
- **Drizzle ORM** - TypeScript-first database ORM
- **PostgreSQL** - Database (Supabase hosted)
- **Deployed on:** Railway

### Frontend
- **React 18 + TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Deployed on:** Vercel

### Infrastructure
- **Database:** Supabase (PostgreSQL 15)
- **Backend:** Railway (Node.js container)
- **Frontend:** Vercel (Static hosting + CDN)

## Detailed Context Files

For detailed information about each part of the stack:

- **Backend:** See [backend/CLAUDE.md](./backend/CLAUDE.md)
  - Tech stack details (Hono, Drizzle, JWT, etc.)
  - Railway deployment configuration
  - Supabase database setup
  - API endpoints and architecture
  - Development and migration workflows

- **Frontend:** See [frontend/CLAUDE.md](./frontend/CLAUDE.md)
  - Tech stack details (React, Vite, TanStack Query, etc.)
  - Vercel deployment configuration
  - Component architecture
  - State management patterns
  - Development workflows

## Quick Start

### Local Development with Docker Compose (Recommended)

```bash
# Start all services (frontend, backend, database)
docker-compose up

# Rebuild after dependency changes
docker-compose up --build

# Stop services
docker-compose down
```

**Service URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

### Backend Development (Standalone)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with DATABASE_URL, CORS_ORIGINS, SECRET_KEY

# Run migrations
npm run db:migrate

# Start dev server (hot reload)
npm run dev
```

**Backend scripts:**
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run db:generate` - Generate migration from schema
- `npm run db:migrate` - Apply migrations

### Frontend Development (Standalone)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with VITE_API_URL

# Start dev server (hot reload)
npm run dev
```

**Frontend scripts:**
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - ESLint
- `npm run type-check` - TypeScript checking

## Architecture Overview

### Data Model

**Core Entity: JobApplication**

```typescript
{
  id: UUID
  user_id: UUID                     // Foreign key to users table
  company_name: string
  position_title: string
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected'
  interview_stage?: string          // e.g., "Phone Screen", "Technical Round 2"
  rejection_stage?: string          // e.g., "After Phone Screen"
  application_date: Date
  salary_range?: string
  location?: string
  notes?: string
  order_index: number               // For Kanban column ordering
  created_at: Date
  updated_at: Date
}
```

**Key Design Decisions:**
- Single `status` enum with optional stage fields (simpler than nested tables)
- `order_index` maintains independent ordering within each status column
- User-scoped data (all applications belong to a user)
- Indexes on `status` and `application_date` for performance

### API Endpoints

All endpoints prefixed with `/api`:

**Authentication (Public):**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/google/login` - Get OAuth URL
- `GET /api/auth/google/callback` - Handle OAuth callback

**Job Applications (Protected):**
- `GET /api/applications` - List user's applications
- `POST /api/applications` - Create application
- `GET /api/applications/:id` - Get single application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `PATCH /api/applications/:id/move` - Optimized drag-drop endpoint

**Analytics (Protected):**
- `GET /api/analytics` - Dashboard statistics

**Health Checks:**
- `GET /health` - Simple health check
- `GET /health/db` - Database health with response time

### State Management

**Frontend:**
- **TanStack Query** - All server state (jobs, analytics, user)
- **React Context** - UI state (theme, auth status)
- **No Redux/Zustand** - React Query eliminates need for global state

**Optimistic Updates:**
- Drag-drop operations update UI immediately
- Rollback on API failure
- Background re-sync after success

### Authentication Flow

1. User logs in → Backend generates JWT token
2. Frontend stores token in localStorage
3. Axios interceptor adds `Authorization: Bearer <token>` to all requests
4. Backend middleware validates JWT on protected routes
5. 401 responses → Auto-logout and redirect to login

## Development Workflows

### Adding a New Field to JobApplication

1. **Backend:**
   ```bash
   cd backend
   # Edit src/db/schema.ts
   npm run db:generate
   npm run db:migrate
   ```

2. **Frontend:**
   ```typescript
   // Edit frontend/src/types/job.ts
   // Update components/forms as needed
   ```

### Adding a New API Endpoint

1. **Backend:**
   - Add route in `src/routes/`
   - Add business logic in `src/services/`
   - Add Zod validation in `src/schemas/`

2. **Frontend:**
   - Add API function in `src/services/api.ts`
   - Create React Query hook in `src/hooks/`
   - Use hook in component

### Database Migrations

**Always use migrations (never manual DB changes):**

```bash
cd backend

# After changing src/db/schema.ts
npm run db:generate

# Review generated SQL in drizzle/ directory
# Apply migration
npm run db:migrate
```

## Deployment

### Production Architecture

```
┌─────────────┐       HTTPS        ┌──────────────┐
│   Vercel    │ ──────────────────> │   Railway    │
│  (Frontend) │                     │  (Backend)   │
└─────────────┘                     └──────────────┘
                                           │
                                           │ PostgreSQL
                                           ▼
                                    ┌──────────────┐
                                    │   Supabase   │
                                    │  (Database)  │
                                    └──────────────┘
```

### Environment Variables

**Backend (Railway):**
```env
DATABASE_URL=postgresql://postgres.[project-ref]:***@aws-0-[region].pooler.supabase.com:6543/postgres
SECRET_KEY=***
CORS_ORIGINS=https://your-app.vercel.app
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-backend.railway.app
```

**Note:** Environment variables must be set in platform dashboards (Railway/Vercel), not committed to repo.

## Common Tasks

### View Logs

**Local:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Production:**
- Backend: Railway Dashboard → Deployments → Logs
- Frontend: Vercel Dashboard → Deployments → Logs

### Database Access

**Local:**
```bash
# GUI (Drizzle Studio)
cd backend && npm run db:studio

# CLI
docker exec -it job-tracker-db psql -U postgres -d jobtracker
```

**Production:**
- Supabase Dashboard → SQL Editor
- Supabase Dashboard → Table Editor

### Health Checks

**Local:**
```bash
curl http://localhost:8080/health
curl http://localhost:8080/health/db
```

**Production:**
```bash
curl https://your-backend.railway.app/health
```

## Important Notes

### Before Making Changes

1. **Always create a git branch** for features/fixes
2. **Test locally first** with `docker-compose up`
3. **Run type checking** (`npm run type-check` in both directories)
4. **Check logs** for errors before deploying

### Database Migrations

- **Never skip migrations** in production
- **Always review generated SQL** before applying
- **Test migrations locally** before deploying to Railway
- **Migrations run automatically** on Railway deployment (Dockerfile CMD)

### Security

- **Never commit `.env` files** (use `.env.example` templates)
- **Rotate `SECRET_KEY` periodically**
- **Use HTTPS only** in production (automatic on Railway/Vercel)
- **Validate all input** with Zod schemas
- **Review dependencies** for vulnerabilities

### Docker Compose

- Good for local full-stack development
- Mirrors production architecture
- Database data persists in Docker volume
- Use `docker-compose down -v` to reset database

### Platform-Specific

- **Railway:** Auto-deploys from GitHub, requires Dockerfile
- **Vercel:** Auto-deploys from GitHub, detects Vite automatically
- **Supabase:** Use pooler connection (port 6543) for serverless environments

## Troubleshooting

### CORS Errors
- Update `CORS_ORIGINS` in Railway to include Vercel URL
- Check both production and preview URLs

### Authentication Issues
- Verify `SECRET_KEY` matches between deployments
- Check JWT token in browser localStorage
- Test with `/api/auth/me` endpoint

### Database Connection
- Ensure using Supabase pooler URL (port 6543)
- Check Supabase connection limit (60 on free tier)
- Verify DATABASE_URL in Railway environment

### Build Failures
- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall
- Review deployment logs in platform dashboard

## Project Goals

This project demonstrates:
1. Modern full-stack TypeScript development
2. Cloud-native deployment (Railway, Vercel, Supabase)
3. Type-safe API with end-to-end TypeScript
4. Modern React patterns (Hooks, Context, React Query)
5. Database migrations and ORM best practices

## Additional Resources

- Backend details: [backend/CLAUDE.md](./backend/CLAUDE.md)
- Frontend details: [frontend/CLAUDE.md](./frontend/CLAUDE.md)
- Docker Compose: [docker-compose.yml](./docker-compose.yml)

---

**Important:** Do not run sub-tasks in background terminal unless explicitly requested.
- all the git actions will be done by me manually
- do not do npm link locally
- do not use local file reference