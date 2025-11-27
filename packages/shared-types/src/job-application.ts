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
 * Uses camelCase for TypeScript/JavaScript conventions
 */
export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  interviewStage?: string | null;
  rejectionStage?: string | null;
  applicationDate: string;
  salaryRange?: string | null;
  location?: string | null;
  notes?: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job application creation payload
 */
export interface JobApplicationCreate {
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  interviewStage?: string | null;
  rejectionStage?: string | null;
  applicationDate: string;
  salaryRange?: string | null;
  location?: string | null;
  notes?: string | null;
  orderIndex?: number;
}

/**
 * Job application update payload (all fields optional)
 */
export interface JobApplicationUpdate {
  companyName?: string;
  positionTitle?: string;
  status?: ApplicationStatus;
  interviewStage?: string | null;
  rejectionStage?: string | null;
  applicationDate?: string;
  salaryRange?: string | null;
  location?: string | null;
  notes?: string | null;
  orderIndex?: number;
}

/**
 * Job application move payload (for drag-drop operations)
 */
export interface JobApplicationMove {
  status: ApplicationStatus;
  orderIndex: number;
  interviewStage?: string | null;
  rejectionStage?: string | null;
}
