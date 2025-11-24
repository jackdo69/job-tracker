/**
 * Job application types.
 */

export enum ApplicationStatus {
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
}

export interface JobApplication {
  id: string;
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

export interface JobApplicationMove {
  status: ApplicationStatus;
  orderIndex: number;
  interviewStage?: string | null;
  rejectionStage?: string | null;
}
