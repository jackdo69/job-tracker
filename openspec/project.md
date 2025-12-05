# Project Context

## Purpose
Job Tracker is a full-stack job application tracking system with a Kanban board interface. The application helps users manage their job search by organizing applications across status columns (Applied → Interviewing → Offer/Rejected) with drag-and-drop functionality, analytics dashboard, and comprehensive application details tracking.

**Key Features:**
- Drag-and-drop Kanban board for managing job applications
- Analytics dashboard with interactive charts and statistics
- JWT-based authentication with email/password and Google OAuth
- RESTful API with type-safe validation
- PostgreSQL database with modern ORM

## Tech Stack

### Backend
- **Node.js 22 + TypeScript** - Runtime and language
- **Hono** - Fast web framework
- **Drizzle ORM** - TypeScript-first database ORM
- **PostgreSQL** - Database (Supabase hosted)
- **Zod** - Schema validation
- **Deployed on:** Railway

### Frontend
- **React 18 + TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Deployed on:** Vercel

### Infrastructure
- **Database:** Supabase (PostgreSQL 15)
- **Backend:** Railway (Node.js container)
- **Frontend:** Vercel (Static hosting + CDN)

## Project Conventions

### Code Style
- **TypeScript strict mode** - All code must be type-safe
- **ESLint** - Linting enforced on both frontend and backend
- **No implicit any** - All types must be explicit
- **Naming conventions:**
  - Files: kebab-case (e.g., `job-application.ts`)
  - Components: PascalCase (e.g., `JobCard.tsx`)
  - Functions/variables: camelCase (e.g., `fetchApplications`)
  - Database fields: snake_case (e.g., `company_name`)
- **Import ordering:** External libraries first, then internal modules
- **Before completion:** Always run `npm run lint`, `npm run type-check`, and `npm run build`

### Architecture Patterns

**Backend:**
- **Service Layer Pattern** - Business logic separated from routes
- **Zod Validation** - All API inputs validated with Zod schemas
- **JWT Authentication** - Token-based auth with middleware
- **Repository Pattern** - Database access through Drizzle ORM
- **Migrations-First** - Never manual DB changes, always use migrations

**Frontend:**
- **Component-Based** - Reusable React components
- **Server State with React Query** - No Redux/Zustand needed
- **Optimistic Updates** - UI updates immediately, rollback on failure
- **Axios Interceptors** - Automatic JWT token injection
- **Type-Safe API** - Shared types between frontend and backend

**Data Model:**
- Single `JobApplication` entity with user_id foreign key
- Status enum: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected'
- Optional stage fields (interview_stage, rejection_stage)
- `order_index` for Kanban column ordering
- Indexed on status and application_date

### Testing Strategy
- Type checking is primary validation (`npm run type-check`)
- ESLint for code quality (`npm run lint`)
- Manual testing in local Docker Compose environment
- Test migrations locally before production deployment
- Health check endpoints for monitoring (`/health`, `/health/db`)

### Git Workflow
**Branch naming:**
- `feat/` - New features/tasks (e.g., `feat/company-profiles`)
- `fix/` - Bug fixes (e.g., `fix/auth-token-expiry`)

**Process:**
1. Start of each task: Pull latest `main` and create feature branch
2. Commit changes with descriptive messages
3. When complete: Push branch and create pull request
4. Never commit directly to `main`

**Important:** Always branch from latest `main` before starting new work.

## Domain Context

**Job Application Lifecycle:**
1. **Applied** - Initial application submitted
2. **Interviewing** - In interview process (with optional stage tracking)
3. **Offer** - Received job offer
4. **Rejected** - Application rejected (with optional stage tracking)

**Business Rules:**
- All applications are user-scoped (multi-tenant by user)
- Each status column maintains independent ordering via `order_index`
- Drag-drop updates position within column and across columns
- Analytics aggregate by status, date ranges, and trends
- Authentication required for all application operations

## Important Constraints

**Security:**
- Never commit `.env` files (use `.env.example` templates)
- All API inputs must be validated with Zod schemas
- JWT tokens stored in localStorage, auto-logout on 401
- HTTPS only in production
- CORS configured to specific origins only

**Database:**
- **Never skip migrations** - All schema changes via Drizzle migrations
- **Always review generated SQL** before applying
- **Test migrations locally** before deploying to production
- Migrations run automatically on Railway deployment
- Use Supabase pooler URL (port 6543) for connection pooling

**Development:**
- Node.js 18+ required
- Docker Compose for local full-stack development
- Always run `source ~/.zshrc` before `npm install`
- Never use `npm link` or local file references
- Run linting and type-checking before considering task complete

**Deployment:**
- Railway auto-deploys backend from GitHub
- Vercel auto-deploys frontend from GitHub
- Environment variables set in platform dashboards, never in code
- Database connection limits: 60 concurrent on Supabase free tier

## External Dependencies

**Hosted Services:**
- **Supabase** - PostgreSQL database hosting
  - Connection: Pooler URL on port 6543
  - Dashboard: SQL Editor, Table Editor
  - Free tier: 60 concurrent connections

- **Railway** - Backend deployment
  - Auto-deploy from GitHub on push
  - Environment variables in dashboard
  - Logs available in deployment view

- **Vercel** - Frontend deployment
  - Auto-deploy from GitHub on push
  - Environment variables in dashboard
  - Automatic HTTPS and CDN

**Third-Party APIs:**
- **Google OAuth** - Authentication provider
  - Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
  - Callback URL must be configured in Google Console

**NPM Packages:**
- Backend: hono, drizzle-orm, pg, zod, jsonwebtoken
- Frontend: react, react-query, axios, tailwindcss, @dnd-kit/core
