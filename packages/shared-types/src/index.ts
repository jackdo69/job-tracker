/**
 * Job Tracker Shared Types
 * Centralized type definitions for frontend and backend
 */

// Company types
export {
  type Company,
  type CompanyCreate,
  type CompanyUpdate,
} from './company.js';

// Job Application types
export {
  ApplicationStatus,
  type JobApplication,
  type JobApplicationCreate,
  type JobApplicationUpdate,
  type JobApplicationMove,
} from './job-application.js';

// User types
export {
  type User,
  type UserCreate,
} from './user.js';

// Authentication types
export {
  type LoginRequest,
  type RegisterRequest,
  type LoginResponse,
  type GoogleCallbackQuery,
} from './auth.js';

// Analytics types
export {
  type ApplicationsByStatus,
  type ApplicationsOverTime,
  type AverageTimePerStage,
  type AnalyticsData,
} from './analytics.js';
