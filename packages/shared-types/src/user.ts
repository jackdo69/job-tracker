/**
 * Shared user types for Job Tracker
 * Used by both frontend and backend
 */

/**
 * User entity (full representation from database)
 * Uses snake_case to match PostgreSQL conventions and API responses
 */
export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User creation payload (for internal use)
 */
export interface UserCreate {
  email: string;
  hashed_password: string;
  full_name?: string | null;
  is_active?: boolean;
}
