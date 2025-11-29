/**
 * Shared user types for Job Tracker
 * Used by both frontend and backend
 */

/**
 * User entity (full representation from database)
 * Uses camelCase for TypeScript/JavaScript conventions
 */
export interface User {
  id: string;
  email: string;
  fullName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User creation payload (for internal use)
 */
export interface UserCreate {
  email: string;
  hashedPassword: string;
  fullName?: string | null;
  isActive?: boolean;
}
