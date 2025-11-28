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
  Cancelled: number;
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
 * Uses camelCase for TypeScript/JavaScript conventions
 */
export interface AnalyticsData {
  totalApplications: number;
  byStatus: ApplicationsByStatus;
  applicationsOverTime: ApplicationsOverTime[];
  averageTimePerStage: AverageTimePerStage;
  successRate: number;
}
