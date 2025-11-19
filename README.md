# Job Tracker

A full-stack job application tracker with a drag-and-drop Kanban board interface. Track your job applications, manage interview stages, and visualize your job search analytics.

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
- FastAPI (Python 3.10+)
- SQLAlchemy 2.0 ORM
- PostgreSQL 15
- Pydantic for validation
- Alembic for migrations

### Infrastructure
- Docker & Docker Compose for containerization and deployment

## Project Structure

```
job-tracker/
├── frontend/              # React application
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── core/        # Config and database
│   ├── alembic/         # Database migrations
│   └── tests/           # Backend tests
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_DECISIONS.md
│   └── API.md
└── docker-compose.yml  # Docker deployment setup
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.10+ (for local backend development)

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

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobtracker

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/applications` | List all job applications |
| POST | `/api/v1/applications` | Create new application |
| GET | `/api/v1/applications/{id}` | Get single application |
| PUT | `/api/v1/applications/{id}` | Update application |
| DELETE | `/api/v1/applications/{id}` | Delete application |
| PATCH | `/api/v1/applications/{id}/move` | Move application to new status |
| GET | `/api/v1/analytics` | Get analytics data |
| GET | `/api/v1/health` | Health check endpoint |

Full API documentation available at: `http://localhost:8000/docs` (when running)

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

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Quality

```bash
# Backend
cd backend
black .                 # Format code
flake8 .               # Lint
mypy .                 # Type checking

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
- [ ] User authentication
- [ ] Multi-user support
- [ ] Email notifications
- [ ] Resume parsing and auto-fill
- [ ] Job board integration (LinkedIn, Indeed)
- [ ] Mobile app
- [ ] Advanced analytics with ML predictions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Technical Decisions](./docs/TECHNICAL_DECISIONS.md)
- [API Documentation](./docs/API.md) (coming soon)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`

---

**Built with ❤️ for job seekers**
