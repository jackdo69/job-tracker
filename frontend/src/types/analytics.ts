/**
 * Analytics types.
 */

export interface ApplicationsByStatus {
  Applied: number;
  Interviewing: number;
  Offer: number;
  Rejected: number;
}

export interface ApplicationsOverTime {
  date: string;
  count: number;
}

export interface AverageTimePerStage {
  Applied: number;
  Interviewing: number;
}

export interface AnalyticsData {
  total_applications: number;
  by_status: ApplicationsByStatus;
  applications_over_time: ApplicationsOverTime[];
  average_time_per_stage: AverageTimePerStage;
  success_rate: number;
}
