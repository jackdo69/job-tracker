# Job Tracker

A full-stack job application tracker with a drag-and-drop Kanban board interface. Track your job applications, manage interview stages, and visualize your job search analytics.

> **🚀 Major Update**: The backend has been migrated from Python/FastAPI to TypeScript/Node.js with Hono framework for improved type safety, performance, and developer experience. See [Backend Migration](#backend-migration) for details.

## Features

- **Kanban Board**: Drag-and-drop interface to move applications through stages
- **Status Tracking**: Track applications through Applied → Interviewing → Offer/Rejected
- **Interview Stages**: Record detailed interview progress (Phone Screen, Technical, Onsite, etc.)
- **Analytics Dashboard**: Visualize application statistics and success rates
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 + TypeScript
- TanStack Query for state management
- @dnd-kit/core for drag-and-drop
- Tailwind CSS for styling
- Recharts for analytics visualization

### Backend
- **Node.js 22** + TypeScript
- **Hono** - Lightweight, ultrafast web framework
- **Drizzle ORM** - TypeScript-first ORM
- PostgreSQL 15
- **Zod** for validation
- **Drizzle Kit** for migrations
- JWT authentication with bcryptjs

### Infrastructure
- Docker & Docker Compose for containerization and deployment

## Project Structure

```
job-tracker/
├── frontend/              # React + TypeScript application
├── backend/              # Node.js + TypeScript application
│   ├── src/
│   │   ├── routes/      # Hono API routes
│   │   ├── services/    # Business logic layer
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── db/          # Database connection & Drizzle schemas
│   │   ├── middleware/  # Authentication middleware
│   │   ├── lib/         # Utilities (auth, config)
│   │   └── index.ts     # Main application entry
│   ├── drizzle/         # Database migrations
│   ├── tsconfig.json    # TypeScript configuration
│   ├── drizzle.config.ts # Drizzle Kit configuration
│   └── package.json     # Node.js dependencies
├── docs/                # Documentation
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_DECISIONS.md
│   └── API.md
└── docker-compose.yml   # Docker deployment setup
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 22+ (or 18+) for local development
- PostgreSQL 15+ (if running locally without Docker)

### Local Development with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd job-tracker

# Start all services
docker-compose up

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Local Development (without Docker)

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set environment variables (create .env file)
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobtracker" > .env
echo "CORS_ORIGINS=http://localhost:3000,http://localhost:8000" >> .env
echo "SECRET_KEY=your-secret-key-change-in-production" >> .env

# Generate and run database migrations
npm run db:generate
npm run db:migrate

# Start development server (with hot reload)
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable
export VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

### Production Deployment with Docker Compose

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart after code changes
docker-compose up -d --build
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info (requires auth) |

### Job Applications (requires authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List all job applications |
| POST | `/api/applications` | Create new application |
| GET | `/api/applications/:id` | Get single application |
| PUT | `/api/applications/:id` | Update application |
| DELETE | `/api/applications/:id` | Delete application |
| PATCH | `/api/applications/:id/move` | Move application to new status |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get analytics data (requires auth) |

### Health Checks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Simple health check |
| GET | `/health/db` | Database health check |
| GET | `/api/health` | API health check |

## Data Model

### Job Application

```typescript
{
  id: string;                    // UUID
  company_name: string;
  position_title: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  interview_stage?: string;      // e.g., "Phone Screen", "Technical Round 2"
  rejection_stage?: string;      // e.g., "After Phone Screen"
  application_date: Date;
  salary_range?: string;         // e.g., "$120k-$150k"
  location?: string;
  notes?: string;
  order_index: number;           // For Kanban ordering
  created_at: Date;
  updated_at: Date;
}
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
cd backend

# Generate migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Push schema directly to database (development only)
npm run db:push
```

### Code Quality

```bash
# Backend
cd backend
npm run build          # TypeScript type checking
# Add ESLint/Prettier as needed

# Frontend
cd frontend
npm run lint           # ESLint
npm run format         # Prettier
npm run type-check     # TypeScript
```

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

Key architectural decisions:
- **Service-Oriented**: Separate frontend, backend, and database services
- **RESTful API**: Standard REST endpoints with OpenAPI documentation
- **Optimistic Updates**: Instant UI feedback on drag-drop operations
- **Containerized Deployment**: Docker containers for consistent deployment
- **State Management**: TanStack Query for server state caching

## Deployment

### Environment Variables

#### Backend
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Frontend
```bash
VITE_API_URL=http://localhost:8000
```

### Production Considerations

1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, DigitalOcean Databases) for production
2. **Secrets**: Store sensitive data using environment variables or external secret managers (AWS Secrets Manager, HashiCorp Vault)
3. **TLS**: Configure reverse proxy (nginx, Traefik) with Let's Encrypt for HTTPS
4. **Monitoring**: Add logging and monitoring solutions (e.g., Datadog, New Relic, or self-hosted Prometheus/Grafana)
5. **Backup**: Implement automated database backup strategy
6. **CI/CD**: Set up GitHub Actions or similar for automated builds and deployments
7. **Resource Limits**: Configure Docker container resource limits in production
8. **Scaling**: Use Docker Swarm or cloud container services (ECS, Cloud Run) for horizontal scaling if needed

## Roadmap

- [x] Basic CRUD operations
- [x] Kanban board with drag-and-drop
- [x] Status tracking (Applied, Interviewing, Offer, Rejected)
- [x] Analytics dashboard
- [x] User authentication (JWT)
- [x] Multi-user support
- [x] TypeScript migration (Python → Node.js)
- [ ] Google OAuth integration (partially implemented)
- [ ] Email notifications
- [ ] Resume parsing and auto-fill
- [ ] Job board integration (LinkedIn, Indeed)
- [ ] Mobile app
- [ ] Advanced analytics with ML predictions
- [ ] API documentation (Swagger/OpenAPI)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Backend Migration

The backend was recently migrated from **Python/FastAPI** to **TypeScript/Node.js** with the following improvements:

### Why Migrate?

- **End-to-End TypeScript**: Unified type system across frontend and backend
- **Performance**: Hono is one of the fastest web frameworks (faster than Express/Fastify)
- **Developer Experience**: Better IDE support, autocomplete, and compile-time type checking
- **Modern Stack**: Leveraging Node.js 22 and latest TypeScript features
- **Type-Safe ORM**: Drizzle provides excellent TypeScript inference

### What Changed?

| Before | After |
|--------|-------|
| Python 3.10+ | Node.js 22 + TypeScript |
| FastAPI | Hono |
| SQLAlchemy | Drizzle ORM |
| Pydantic | Zod |
| Alembic | Drizzle Kit |

### Migration Impact

- ✅ **Zero Frontend Changes**: API contract maintained, frontend works without modification
- ✅ **Database Compatible**: Same PostgreSQL schema, existing data preserved
- ✅ **JWT Compatible**: Same authentication tokens work across versions
- ✅ **Environment Variables**: Same configuration format

For detailed backend documentation, see [README-TYPESCRIPT.md](./backend/README-TYPESCRIPT.md).

## Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Technical Decisions](./docs/TECHNICAL_DECISIONS.md)
- [API Documentation](./docs/API.md) (coming soon)
- [Backend TypeScript Guide](./backend/README-TYPESCRIPT.md)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`

---

**Built with ❤️ for job seekers**
