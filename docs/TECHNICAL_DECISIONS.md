# Technical Decisions

This document records all major technical decisions made for the Job Tracker application, along with rationale and alternatives considered.

## TD-001: Drag-and-Drop Library Selection

**Decision**: Use `@dnd-kit/core` for drag-and-drop functionality

**Date**: 2025-11-15

**Context**: Need a robust drag-and-drop library for Kanban board implementation

**Options Considered**:
1. **@dnd-kit/core** ✅
2. react-beautiful-dnd
3. react-dnd

**Rationale**:
- **Performance**: Modern architecture with better performance than alternatives
- **Accessibility**: Built-in keyboard navigation and screen reader support
- **TypeScript**: Excellent TypeScript support out of the box
- **Bundle Size**: Smaller footprint than alternatives
- **Active Maintenance**: Actively maintained (react-beautiful-dnd is in maintenance mode)
- **Touch Support**: Better mobile/touch device support
- **Flexibility**: More flexible API for custom behaviors

**Trade-offs**:
- Slightly newer library (less Stack Overflow content)
- More verbose API compared to react-beautiful-dnd

---

## TD-002: Backend Framework Selection

**Decision**: Use FastAPI with Python 3.11+

**Date**: 2025-11-15

**Context**: Need a backend framework that aligns with learning Python and supports modern async patterns

**Options Considered**:
1. **FastAPI** ✅
2. Django + Django REST Framework
3. Flask
4. Node.js + Express

**Rationale**:
- **Auto Documentation**: Automatic OpenAPI/Swagger documentation
- **Type Safety**: Pydantic validation provides runtime type checking
- **Performance**: Async/await support for high concurrency
- **Learning Goal**: Aligns with user's goal to learn Python
- **Developer Experience**: Excellent IDE support and fast development
- **Modern Python**: Uses Python 3.11+ features (type hints, async)
- **Frontend Integration**: Auto-generated TypeScript clients possible

**Trade-offs**:
- Less batteries-included than Django
- Smaller ecosystem than Node.js

---

## TD-003: State Management Strategy

**Decision**: Use TanStack Query (React Query) for server state, local state for UI

**Date**: 2025-11-15

**Context**: Need efficient state management for API data and UI state

**Options Considered**:
1. **TanStack Query + Local State** ✅
2. Redux Toolkit
3. Zustand
4. Recoil

**Rationale**:
- **Purpose-Built**: Specifically designed for server state management
- **Caching**: Automatic caching and invalidation
- **Optimistic Updates**: Built-in support for optimistic UI updates
- **Devtools**: Excellent developer tools for debugging
- **Less Boilerplate**: Simpler than Redux for API state
- **Performance**: Automatic request deduplication and background refetching

**Trade-offs**:
- Learning curve for React Query concepts (queries, mutations, cache)
- Additional dependency vs. plain useState/useEffect

---

## TD-004: Database Choice

**Decision**: PostgreSQL 15

**Date**: 2025-11-15

**Context**: Need a reliable database for job application data

**Options Considered**:
1. **PostgreSQL** ✅
2. MySQL
3. MongoDB
4. SQLite

**Rationale**:
- **Reliability**: Industry-standard, production-proven
- **JSONB Support**: Flexible schema for notes and future extensions
- **ENUM Types**: Native support for status enums
- **Full-Text Search**: Built-in for searching notes/company names
- **Kubernetes Ready**: Easy to deploy as StatefulSet
- **SQL Compliance**: Strong ACID guarantees
- **Community**: Large community and ecosystem

**Trade-offs**:
- More resource-intensive than SQLite
- Requires separate service deployment

---

## TD-005: ORM Selection

**Decision**: SQLAlchemy 2.0

**Date**: 2025-11-15

**Context**: Need an ORM for database interactions in FastAPI

**Options Considered**:
1. **SQLAlchemy 2.0** ✅
2. Tortoise ORM
3. Prisma (Python)
4. Raw SQL

**Rationale**:
- **Maturity**: Most mature and widely-used Python ORM
- **Async Support**: SQLAlchemy 2.0 has full async support
- **Flexibility**: Can use ORM or query builder
- **Migration Tools**: Excellent Alembic integration
- **FastAPI Integration**: Well-documented patterns
- **Type Hints**: Good typing support in 2.0

**Trade-offs**:
- More complex than newer ORMs like Prisma
- Learning curve for advanced features

---

## TD-006: Styling Approach

**Decision**: Tailwind CSS

**Date**: 2025-11-15

**Context**: Need a styling solution for React frontend

**Options Considered**:
1. **Tailwind CSS** ✅
2. Material-UI (MUI)
3. Styled Components
4. CSS Modules

**Rationale**:
- **Rapid Development**: Utility-first approach speeds up development
- **Consistency**: Built-in design system
- **Performance**: Purges unused CSS in production
- **Customization**: Easy to customize design tokens
- **Bundle Size**: Smaller than component libraries like MUI
- **No Runtime**: Zero-runtime overhead (unlike CSS-in-JS)

**Trade-offs**:
- Verbose className strings
- Need to build components from scratch (no pre-built components)

---

## TD-007: Data Model - Status Field

**Decision**: Use single `status` enum with optional `interview_stage` and `rejection_stage` fields

**Date**: 2025-11-15

**Context**: Need to track application status including sub-stages for interviews and rejections

**Options Considered**:
1. **Single status enum + optional stage fields** ✅
2. Separate status and sub-status tables
3. JSONB for flexible stage tracking
4. Flat enum with all combinations

**Rationale**:
- **Simplicity**: Easier to query and filter by main status
- **Flexibility**: Stage fields provide detail when needed
- **Validation**: Can enforce rules (e.g., interview_stage only when status='Interviewing')
- **UI Mapping**: Clean mapping to Kanban columns
- **Analytics**: Simpler aggregation by main status

**Data Structure**:
```python
status: Enum('Applied', 'Interviewing', 'Offer', 'Rejected')
interview_stage: Optional[String]  # "Phone Screen", "Technical Round 1", etc.
rejection_stage: Optional[String]  # "After Phone Screen", "After Onsite", etc.
```

**Trade-offs**:
- Need validation to ensure stage fields match status
- More nullable fields than fully normalized approach

---

## TD-008: Docker Deployment Strategy

**Decision**: Deploy with Docker and Docker Compose

**Date**: 2025-11-15 (Updated: 2025-11-17)

**Context**: Simplified deployment to reduce complexity and cost

**Options Considered**:
1. **Docker Compose** ✅
2. Kubernetes
3. Heroku/Vercel
4. AWS ECS

**Rationale**:
- **Simplicity**: Straightforward deployment with minimal configuration
- **Cost-Effective**: Lower resource requirements for development and production
- **Portability**: Can run on any system with Docker installed
- **Easy Setup**: Quick to get started with minimal learning curve
- **Sufficient for MVP**: Meets current application needs without over-engineering
- **Local Development**: Identical environment for dev and production

**Trade-offs**:
- Less automated scaling compared to Kubernetes
- Manual management of containers in production
- If scaling needs grow, may need to migrate to orchestration platform

**Future Scaling Options**:
- Docker Swarm for simple orchestration
- Cloud container services (AWS ECS, Google Cloud Run)
- Kubernetes if complex orchestration becomes necessary

---

## TD-009: API Endpoint for Drag-Drop

**Decision**: Create dedicated `PATCH /api/applications/{id}/move` endpoint

**Date**: 2025-11-15

**Context**: Need efficient API for drag-drop status updates

**Options Considered**:
1. **Dedicated `/move` endpoint** ✅
2. Use generic `PUT /api/applications/{id}`
3. Batch update endpoint

**Rationale**:
- **Optimized**: Only sends minimal data (new status, order_index)
- **Semantics**: Clear intent for drag-drop operations
- **Validation**: Can add specific validation for valid status transitions
- **Performance**: Lighter payload than full PUT
- **Analytics**: Easy to track status changes separately

**Endpoint Design**:
```json
PATCH /api/applications/{id}/move
{
  "status": "Interviewing",
  "order_index": 3,
  "interview_stage": "Technical Round 1"
}
```

**Trade-offs**:
- Additional endpoint to maintain
- Could be achieved with partial PUT

---

## TD-010: Order Tracking for Kanban

**Decision**: Use `order_index` integer field for card ordering within columns

**Date**: 2025-11-15

**Context**: Need to persist card order within Kanban columns

**Options Considered**:
1. **Integer order_index field** ✅
2. Linked list (previous_id, next_id)
3. Fractional indexing
4. Timestamp-based ordering

**Rationale**:
- **Simplicity**: Easy to understand and query
- **Performance**: Simple integer comparison
- **Reordering**: Can reassign order on drag-drop
- **No Gaps**: Can compact/reorder periodically if needed

**Implementation**:
- Each status column has independent ordering (0, 1, 2, ...)
- On drag-drop, update order_index for affected cards
- Query: `ORDER BY order_index ASC` within each status

**Trade-offs**:
- Need to update multiple records on reorder
- Potential for gaps in numbering (acceptable)

---

## TD-011: Authentication Decision

**Decision**: No authentication in v1, design for easy addition later

**Date**: 2025-11-15

**Context**: Balance between MVP and future multi-user support

**Rationale**:
- **MVP Focus**: Single-user application for initial version
- **Faster Development**: Can ship core features quickly
- **Future-Ready**: Design API to easily add user context later

**Future Implementation Path**:
1. Add user authentication (JWT)
2. Add `user_id` foreign key to job_applications table
3. Add user context to all queries
4. Add registration/login endpoints

**Trade-offs**:
- Not production-ready for multi-user
- Will require migration to add user_id later

---

## Summary

These decisions prioritize:
1. **Learning Goals**: Python backend development with FastAPI
2. **Simplicity**: Docker-based deployment for ease of use and cost-effectiveness
3. **Modern Stack**: Latest tools and best practices
4. **Developer Experience**: Fast development, good tooling
5. **Scalability**: Room to grow and add features
6. **Type Safety**: TypeScript and Pydantic for reliability

All decisions are documented and can be revisited as requirements evolve.
