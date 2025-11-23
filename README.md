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
- **Node.js 22** + TypeScript
- **Hono** - Lightweight, ultrafast web framework
- **Drizzle ORM** - TypeScript-first ORM
- PostgreSQL 15
- **Zod** for validation
- **Drizzle Kit** for migrations
- **Pino** for logging
- JWT authentication with bcryptjs

### Infrastructure
- Docker & Docker Compose for containerization and deployment

---

**Built with ❤️ for job seekers**
