/**
 * Shared job application types for Job Tracker
 * Used by both frontend and backend
 */

/**
 * Application status enum
 */
export enum ApplicationStatus {
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
}

/**
 * Job application entity (full representation from database)
 * Uses snake_case to match PostgreSQL conventions and API responses
 */
export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  status: ApplicationStatus;
  interview_stage?: string | null;
  rejection_stage?: string | null;
  application_date: string;
  salary_range?: string | null;
  location?: string | null;
  notes?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Job application creation payload
 */
export interface JobApplicationCreate {
  company_name: string;
  position_title: string;
  status: ApplicationStatus;
  interview_stage?: string | null;
  rejection_stage?: string | null;
  application_date: string;
  salary_range?: string | null;
  location?: string | null;
  notes?: string | null;
  order_index?: number;
}

/**
 * Job application update payload (all fields optional)
 */
export interface JobApplicationUpdate {
  company_name?: string;
  position_title?: string;
  status?: ApplicationStatus;
  interview_stage?: string | null;
  rejection_stage?: string | null;
  application_date?: string;
  salary_range?: string | null;
  location?: string | null;
  notes?: string | null;
  order_index?: number;
}

/**
 * Job application move payload (for drag-drop operations)
 */
export interface JobApplicationMove {
  status: ApplicationStatus;
  order_index: number;
  interview_stage?: string | null;
  rejection_stage?: string | null;
}
