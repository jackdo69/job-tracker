# Job Tracker Backend

Node.js/TypeScript backend for the Job Tracker application with Hono framework.

## Tech Stack

- **Node.js 22** (or 18+) + TypeScript
- **Hono** - Lightweight web framework
- **Drizzle ORM** - TypeScript-first ORM
- **PostgreSQL** - Database
- **Zod** - Validation
- **Pino** - Logging
- **JWT** - Authentication (bcryptjs)

## Installation

### Prerequisites

- Node.js 22+ (or 18+)
- PostgreSQL 15+
- npm

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobtracker
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
SECRET_KEY=your-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
HOST=0.0.0.0
PORT=8080
LOG_LEVEL=info
```

### Setup

```bash
# Install dependencies
npm install

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev             # Start dev server with hot reload
npm run build           # Build TypeScript to JavaScript
npm start               # Start production server
npm run db:generate     # Generate migrations from schema
npm run db:migrate      # Run pending migrations (development)
npm run db:migrate:prod # Run pending migrations (production, uses compiled JS)
npm run db:studio       # Open Drizzle Studio (database GUI)
npm run db:push         # Push schema to database (dev only)
```

## Database Migrations

### Create New Migration

1. Update schema in `src/db/schema.ts`
2. Generate migration:
   ```bash
   npm run db:generate
   ```
3. Review generated SQL in `drizzle/` directory
4. Apply migration:
   ```bash
   npm run db:migrate
   ```

### Database Schema

- `users` - User authentication
- `job_applications` - Job applications (linked to users)
- `status_enum` - Application status (Applied, Interviewing, Offer, Rejected)

## Docker

### Build and Run

```bash
# Build Docker image
docker build -t job-tracker-backend .

# Run container
docker run -p 8080:8080 --env-file .env job-tracker-backend
```

### Docker Compose

```yaml
backend:
  build: ./backend
  ports:
    - "8080:8080"
  environment:
    - DATABASE_URL=postgresql://postgres:postgres@db:5432/jobtracker
    - CORS_ORIGINS=http://localhost:3000
    - SECRET_KEY=your-secret-key
  depends_on:
    - db
```

Run with Docker Compose:

```bash
# Start all services
docker-compose up

# Rebuild after changes
docker-compose up --build

# Stop services
docker-compose down
```

## API Endpoints

### Health Checks (Public - No Auth)
- `GET /` - Root endpoint with API info
- `GET /health` - Simple health check
- `GET /health/db` - Database health check with response time
- `GET /api/health` - API health check

### Authentication
- `POST /api/auth/register` - Register user (public)
- `POST /api/auth/login` - Login and get JWT token (public)
- `GET /api/auth/me` - Get current user (auth required)

### Job Applications (Auth Required)
- `GET /api/applications` - List all applications
- `POST /api/applications` - Create application
- `GET /api/applications/:id` - Get application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `PATCH /api/applications/:id/move` - Move application (drag-drop)

### Analytics (Auth Required)
- `GET /api/analytics` - Get dashboard analytics

## Troubleshooting

### Database Connection
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `psql -U postgres -l`

### Pino Logger (Node.js 18)
If you encounter errors with Pino on Node.js 18, update to Node.js 19.9+ or use:
```bash
npm install pino@8
```

### Migration Errors
- Check generated SQL in `drizzle/` directory
- Use `npm run db:studio` to inspect database
- Use `npm run db:push` for quick schema sync (dev only)

## Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod Validation](https://zod.dev/)
- [Pino Logger](https://getpino.io/)
