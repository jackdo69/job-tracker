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

export interface JobApplicationMove {
  status: ApplicationStatus;
  order_index: number;
  interview_stage?: string | null;
  rejection_stage?: string | null;
}
