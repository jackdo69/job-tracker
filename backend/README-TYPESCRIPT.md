# Job Tracker Backend - TypeScript/Node.js

This is the TypeScript/Node.js backend for the Job Tracker application, converted from the original Python/FastAPI implementation.

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Hono (lightweight web framework)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Zod
- **Authentication**: JWT with bcryptjs
- **Language**: TypeScript

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle database schemas
│   │   ├── db.ts              # Database connection
│   │   └── migrate.ts         # Migration runner
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── applications.ts    # Job applications CRUD
│   │   └── analytics.ts       # Analytics endpoints
│   ├── services/
│   │   ├── auth-service.ts    # Authentication business logic
│   │   ├── job-service.ts     # Job applications business logic
│   │   └── analytics-service.ts # Analytics calculations
│   ├── schemas/
│   │   ├── user.ts            # Zod validation schemas for users
│   │   ├── job-application.ts # Zod validation schemas for jobs
│   │   └── analytics.ts       # Zod validation schemas for analytics
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── lib/
│   │   ├── config.ts          # Application configuration
│   │   └── auth.ts            # JWT and password hashing utilities
│   └── index.ts               # Main application entry point
├── drizzle/                   # Generated migrations
├── drizzle.config.ts          # Drizzle configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Node.js dependencies
└── Dockerfile                 # Docker configuration
```

## Development Setup

### Prerequisites

- Node.js 22 (or 18+)
- PostgreSQL database
- npm or yarn

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobtracker
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
SECRET_KEY=your-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
HOST=0.0.0.0
PORT=8000
```

### Installation

```bash
# Install dependencies
npm install

# Generate migrations (if schema changes)
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload (using tsx)
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations from schema
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:push` - Push schema changes directly to database (development only)

## API Endpoints

All endpoints are prefixed with `/api`:

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (requires auth)

### Job Applications (`/api/applications`)

All endpoints require authentication.

- `GET /api/applications` - List all applications for current user
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get single application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `PATCH /api/applications/:id/move` - Move application (drag-drop)

### Analytics (`/api/analytics`)

- `GET /api/analytics` - Get dashboard analytics (requires auth)

### Health Checks

- `GET /health` - Simple health check
- `GET /health/db` - Database health check
- `GET /api/health` - API health check

## Database Migrations

This project uses Drizzle Kit for database migrations.

### Creating a New Migration

1. Update the schema in `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review the generated SQL in `drizzle/` directory
4. Run migration: `npm run db:migrate`

### Migration from Python/SQLAlchemy

The database schema is compatible with the existing PostgreSQL database created by the Python/FastAPI backend. The Drizzle schema matches the SQLAlchemy models:

- `users` table (authentication)
- `job_applications` table (job applications with user_id foreign key)
- `status_enum` (Applied, Interviewing, Offer, Rejected)

## Docker Deployment

### Build and Run with Docker

```bash
# Build image
docker build -t job-tracker-backend .

# Run container
docker run -p 8000:8000 --env-file .env job-tracker-backend
```

### Docker Compose

The backend is configured to work with docker-compose. Update your `docker-compose.yml` to use the Node.js backend:

```yaml
backend:
  build: ./backend
  ports:
    - "8000:8000"
  environment:
    - DATABASE_URL=postgresql://postgres:postgres@db:5432/jobtracker
    - CORS_ORIGINS=http://localhost:3000,http://localhost:8000
  depends_on:
    - db
```

## Key Differences from Python Backend

### Framework: Hono vs FastAPI

- **Hono** is a lightweight, fast web framework for Node.js (similar to Express but faster)
- Routes are defined using chainable methods
- Middleware is applied using `.use()`
- Type-safe with TypeScript

### ORM: Drizzle vs SQLAlchemy

- **Drizzle** is a TypeScript-first ORM with excellent type inference
- Schema defined in TypeScript (not decorators)
- Uses `drizzle-kit` for migrations
- More SQL-like query builder

### Validation: Zod vs Pydantic

- **Zod** is a TypeScript-first validation library
- Schema definition and TypeScript types are unified
- Runtime validation with full type safety
- Integrated with Hono using `@hono/zod-validator`

### Authentication

- JWT signing/verification using `jsonwebtoken`
- Password hashing using `bcryptjs`
- Bearer token authentication in middleware

## Performance Notes

- Hono is extremely fast (comparable to Fastify)
- Drizzle generates optimized SQL queries
- Connection pooling configured in `db.ts`
- TypeScript provides compile-time type safety

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` environment variable
- Verify database exists: `psql -U postgres -l`

### Migration Issues

- If migrations fail, check `drizzle/` directory for SQL errors
- Use `npm run db:studio` to inspect database state
- For development, you can use `npm run db:push` to sync schema directly

### TypeScript Errors

- Run `npm run build` to check for type errors
- Ensure all dependencies are installed
- Check `tsconfig.json` configuration

## Next Steps / TODO

- [ ] Implement Google OAuth routes (`/api/auth/google/login`, `/api/auth/google/callback`)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add tests (use Vitest or Jest)
- [ ] Add request rate limiting
- [ ] Add request logging/monitoring
- [ ] Optimize database queries with indexes
- [ ] Add database query caching

## Migration Guide for Developers

If you're migrating from the Python backend:

1. **Database**: The TypeScript backend uses the same database schema, so no database migration needed
2. **API Compatibility**: All endpoints maintain the same request/response format
3. **Authentication**: JWT tokens are compatible (same SECRET_KEY)
4. **Environment**: Update `.env` file (same variables)
5. **Frontend**: No frontend changes required - API contract is maintained

## Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
