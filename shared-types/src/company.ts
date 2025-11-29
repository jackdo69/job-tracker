/**
 * Shared company types for Job Tracker
 * Used by both frontend and backend
 */

/**
 * Company entity (full representation from database)
 * Uses camelCase for TypeScript/JavaScript conventions
 */
export interface Company {
  id: string;
  userId: string;
  name: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Company creation payload
 */
export interface CompanyCreate {
  name: string;
  logo?: string | null;
}

/**
 * Company update payload (all fields optional)
 */
export interface CompanyUpdate {
  name?: string;
  logo?: string | null;
}
