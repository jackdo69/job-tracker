/**
 * Shared analytics types for Job Tracker
 * Used by both frontend and backend
 */

/**
 * Application count by status
 */
export interface ApplicationsByStatus {
  Applied: number;
  Interviewing: number;
  Offer: number;
  Rejected: number;
}

/**
 * Applications over time data point
 */
export interface ApplicationsOverTime {
  date: string;
  count: number;
}

/**
 * Average time spent in each stage (in days)
 */
export interface AverageTimePerStage {
  Applied: number;
  Interviewing: number;
}

/**
 * Complete analytics data
 * Uses snake_case to match API response format
 */
export interface AnalyticsData {
  total_applications: number;
  by_status: ApplicationsByStatus;
  applications_over_time: ApplicationsOverTime[];
  average_time_per_stage: AverageTimePerStage;
  success_rate: number;
}
