# Backend Context - Job Tracker API

This file provides context for Claude Code when working with the Job Tracker backend.

## Tech Stack

### Core
- **Node.js 22** (Alpine in Docker) + TypeScript
- **Hono** - Fast, lightweight web framework for Edge runtimes
- **Drizzle ORM** - TypeScript-first SQL ORM with type safety
- **PostgreSQL 15+** - Primary database (hosted on Supabase)

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Google OAuth 2.0** - Social login support
- **Zod** - Runtime validation and type safety

### Logging & Monitoring
- **Pino** - High-performance JSON logger
- **pino-pretty** - Development log formatting

### Development Tools
- **tsx** - TypeScript execution for development
- **Drizzle Kit** - Database migrations and schema management
- **TypeScript 5.9+** - Strict type checking

## Architecture

### Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle ORM schema definitions
│   │   ├── db.ts              # Database connection (postgres.js)
│   │   └── migrate.ts         # Migration runner
│   ├── routes/
│   │   ├── health.ts          # Health check endpoints
│   │   ├── auth.ts            # Authentication routes
│   │   ├── applications.ts    # Job application CRUD
│   │   └── analytics.ts       # Dashboard analytics
│   ├── services/
│   │   ├── auth-service.ts    # Auth business logic
│   │   ├── job-service.ts     # Job application logic
│   │   └── analytics-service.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── logger.ts          # Request logging middleware
│   ├── schemas/
│   │   ├── user.ts            # Zod schemas for user validation
│   │   ├── job-application.ts # Zod schemas for jobs
│   │   └── analytics.ts       # Analytics response schemas
│   ├── lib/
│   │   ├── config.ts          # Environment configuration
│   │   ├── logger.ts          # Pino logger setup
│   │   └── auth.ts            # JWT utilities
│   └── index.ts               # Application entry point
├── drizzle/                   # Generated SQL migrations
├── dist/                      # Compiled JavaScript output
├── Dockerfile                 # Production Docker image
├── drizzle.config.ts         # Drizzle Kit configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

### Database Schema

**Tables:**
- `users` - User accounts with email/password or OAuth
  - id (UUID, PK)
  - email (unique)
  - hashed_password
  - full_name
  - is_active
  - created_at, updated_at

- `job_applications` - Job tracking with Kanban status
  - id (UUID, PK)
  - user_id (FK → users.id, CASCADE)
  - company_name
  - position_title
  - status (enum: 'Applied', 'Interviewing', 'Offer', 'Rejected')
  - interview_stage (optional: "Phone Screen", "Technical Round 2", etc.)
  - rejection_stage (optional: "After Phone Screen", etc.)
  - application_date
  - salary_range
  - location
  - notes (text)
  - order_index (for Kanban column ordering)
  - created_at, updated_at

**Indexes:**
- `job_applications.status` - For efficient Kanban board queries
- `job_applications.application_date` - For analytics and sorting

### API Endpoints

All endpoints prefixed with `/api` (configured in `lib/config.ts`).

**Public (No Auth):**
- `GET /` - API info
- `GET /health` - Health check
- `GET /health/db` - Database health with response time
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/google/login` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Handle OAuth callback

**Protected (JWT Required):**
- `GET /api/auth/me` - Get current user info
- `GET /api/applications` - List all user's job applications
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get single application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `PATCH /api/applications/:id/move` - Optimized drag-drop endpoint
- `GET /api/analytics` - Dashboard statistics

**Special Endpoint:**
The `/move` endpoint is optimized for Kanban drag-drop:
```json
{
  "status": "Interviewing",
  "order_index": 3,
  "interview_stage": "Technical Round 1"
}
```

## Deployment

### Railway (Production)

**Platform:** Railway.app
**Region:** Auto-selected based on proximity
**Build:** Dockerfile-based deployment

**Environment Variables (Railway):**
```env
# Database (Supabase connection string)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Security
SECRET_KEY=<generate-strong-random-key>

# CORS (Vercel frontend URL)
CORS_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
GOOGLE_REDIRECT_URI=https://your-api.railway.app/api/auth/google/callback

# Server (Railway auto-assigns PORT)
HOST=0.0.0.0
PORT=8080
```

**Deployment Process:**
1. Railway automatically detects Dockerfile
2. Builds image with multi-stage build
3. Runs migrations via `npm run db:migrate:prod`
4. Starts server with `npm start`

**Important Railway Notes:**
- Railway provides a public domain: `<app-name>.up.railway.app`
- Use environment variables for all config (never commit secrets)
- Database migrations run automatically on deployment (CMD in Dockerfile)
- Supports automatic deployments from GitHub (configure in Railway dashboard)

### Supabase (Database)

**Platform:** Supabase (PostgreSQL 15)
**Connection Mode:** Pooler (required for serverless environments like Railway)

**Connection String Format:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Supabase Dashboard:**
- Database schema viewer
- SQL Editor for manual queries
- Table Editor for data management
- Real-time monitoring

**Important Supabase Notes:**
- Use **Pooler connection string** (port 6543) for Railway
- Direct connection (port 5432) only for local development tools
- Enable "Connection Pooling" in Supabase settings
- Database timezone: UTC (ensure consistency with application)
- Automatic backups enabled (daily snapshots)

## Configuration

### Local Development

**Prerequisites:**
- Node.js 22+ (or 18+)
- PostgreSQL 15+ (Docker or local)
- npm

**Setup:**
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env for local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobtracker
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
SECRET_KEY=local-dev-secret-key
HOST=0.0.0.0
PORT=8080

# Generate migrations (after schema changes)
npm run db:generate

# Run migrations
npm run db:migrate

# Start dev server (hot reload)
npm run dev
```

**Available Scripts:**
```bash
npm run dev             # Start with tsx watch (hot reload)
npm run build           # Compile TypeScript to dist/
npm start               # Run compiled JavaScript
npm run db:generate     # Generate migration from schema.ts
npm run db:migrate      # Run migrations (development)
npm run db:migrate:prod # Run migrations (production, uses dist/)
npm run db:studio       # Open Drizzle Studio GUI
npm run db:push         # Push schema directly (dev only, skip migrations)
```

### Remote Development (Supabase)

**Option 1: Local Backend + Supabase Database**
```env
# .env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=local-dev-secret-key
```

```bash
# Run migrations against Supabase
npm run db:migrate

# Start local server
npm run dev
```

**Option 2: Connect to Railway Backend**
- Use Railway's environment variables
- Test with Railway's public URL
- View logs in Railway dashboard

### Docker Compose (Full Stack Local)

```bash
# From project root
docker-compose up

# Backend runs on http://localhost:8080
# PostgreSQL on localhost:5432
# Frontend on http://localhost:3000

# Rebuild after changes
docker-compose up --build

# Stop and remove volumes
docker-compose down -v
```

## Database Migrations

### Creating Migrations

**Workflow:**
1. Update `src/db/schema.ts` with new columns/tables
2. Generate migration:
   ```bash
   npm run db:generate
   ```
3. Review SQL in `drizzle/` directory
4. Apply migration:
   ```bash
   # Development
   npm run db:migrate

   # Production (uses compiled JS)
   npm run db:migrate:prod
   ```

**Example: Add New Field**
```typescript
// src/db/schema.ts
export const jobApplications = pgTable('job_applications', {
  // ... existing fields
  newField: varchar('new_field', { length: 100 }),
});
```

```bash
npm run db:generate -- --name "add_new_field"
npm run db:migrate
```

### Migration Best Practices

- **Always use migrations** (never modify DB manually in production)
- **Review generated SQL** before applying
- **Test migrations locally** before deploying
- **Use descriptive names** (`--name "add_user_avatar"`)
- **Avoid `db:push` in production** (use migrations for tracking)

## Common Development Tasks

### Adding a New API Endpoint

1. **Define route in `routes/`:**
   ```typescript
   // routes/applications.ts
   app.get('/applications', authMiddleware, async (c) => {
     // ...
   });
   ```

2. **Add business logic in `services/`:**
   ```typescript
   // services/job-service.ts
   export async function getApplications(userId: string) {
     // ...
   }
   ```

3. **Add Zod validation:**
   ```typescript
   // schemas/job-application.ts
   export const jobApplicationCreateSchema = z.object({
     company_name: z.string().min(1),
     // ...
   });
   ```

### Adding Authentication to Routes

```typescript
import { authMiddleware } from '../middleware/auth.js';

app.get('/protected', authMiddleware, async (c) => {
  const user = c.get('user'); // Set by authMiddleware
  // ...
});
```

### Debugging

**View Logs:**
```bash
# Railway
railway logs --follow

# Local
npm run dev  # Logs to console with pino-pretty
```

**Database Inspection:**
```bash
# Drizzle Studio (GUI)
npm run db:studio

# Supabase Dashboard
# Visit https://app.supabase.com/project/<project-ref>

# psql (direct connection)
psql "postgresql://postgres.[project-ref]:[password]@db.[region].supabase.co:5432/postgres"
```

**Health Checks:**
```bash
# Local
curl http://localhost:8080/health
curl http://localhost:8080/health/db

# Railway
curl https://your-app.railway.app/health
```

## Troubleshooting

### Database Connection Issues

**Symptom:** `connection refused` or timeout errors

**Solutions:**
- Check `DATABASE_URL` format (pooler vs direct)
- Verify Supabase database is running
- Check Railway environment variables
- Test connection with psql

### Migration Errors

**Symptom:** `relation already exists` or schema drift

**Solutions:**
```bash
# Reset local database (dev only!)
docker-compose down -v
docker-compose up

# Use db:push for quick schema sync (dev only)
npm run db:push

# Check migration history
npm run db:studio
```

### JWT Authentication Fails

**Symptom:** 401 errors on protected routes

**Solutions:**
- Verify `SECRET_KEY` matches between backend and token generation
- Check token expiration (`accessTokenExpireMinutes` in config)
- Inspect token in browser DevTools → Application → Local Storage
- Test with `/api/auth/me` endpoint

### CORS Errors

**Symptom:** Browser blocks requests from frontend

**Solutions:**
```env
# Update CORS_ORIGINS in Railway
CORS_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com

# Local development
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Important Notes

### Railway Deployment

- **Automatic deployments:** Connect GitHub repo in Railway dashboard
- **Environment variables:** Set in Railway UI (Project → Variables)
- **Logs:** Available in Railway dashboard (real-time)
- **Custom domain:** Configure in Railway → Settings → Domains
- **Scaling:** Railway auto-scales based on resource usage

### Supabase Database

- **Pooler required:** Railway is ephemeral, use connection pooling
- **Connection limit:** Supabase free tier = 60 connections
- **Backups:** Daily automatic backups (7-day retention on free tier)
- **Monitoring:** View in Supabase Dashboard → Database → Monitoring
- **Extensions:** Enable pgvector, pg_cron, etc. in Supabase SQL Editor

### Security Considerations

- **Never commit `.env` files** (use `.env.example` template)
- **Rotate `SECRET_KEY` regularly**
- **Use strong passwords** for database
- **Enable HTTPS only** in production (Railway provides automatic SSL)
- **Validate all input** with Zod schemas
- **Rate limit API** (consider implementing in middleware)

### Code Style

- **ES Modules:** Use `.js` extensions in imports (required for Node.js ESM)
- **Async/await:** Preferred over promises
- **Type safety:** Leverage Drizzle's type inference
- **Logging:** Use `logger` from `lib/logger.ts` (not `console.log`)
- **Error handling:** Use Hono's `HTTPException` for API errors

## Resources

- [Hono Documentation](https://hono.dev/) - Web framework
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Railway Docs](https://docs.railway.app/) - Deployment platform
- [Supabase Docs](https://supabase.com/docs) - PostgreSQL hosting
- [Zod](https://zod.dev/) - Validation
- [Pino](https://getpino.io/) - Logging
