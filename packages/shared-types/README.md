# @jackdo69/job-tracker-shared-types

Shared TypeScript types for Job Tracker frontend and backend.

## Installation

```bash
npm install @jackdo69/job-tracker-shared-types
```

## Usage

```typescript
import {
  ApplicationStatus,
  type JobApplication,
  type JobApplicationCreate,
  type JobApplicationUpdate,
  type User,
  type LoginRequest,
  type LoginResponse,
  type AnalyticsData,
} from '@jackdo69/job-tracker-shared-types';

// Example
const job: JobApplication = {
  id: '123',
  user_id: '456',
  company_name: 'Acme Corp',
  position_title: 'Software Engineer',
  status: ApplicationStatus.APPLIED,
  application_date: '2025-01-01',
  order_index: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  // ... other fields
};
```

## Publishing

```bash
cd packages/shared-types

# Bump version and publish
npm version patch  # or minor/major
npm run publish:type
```

## License

MIT
