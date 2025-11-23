/**
 * Business logic for analytics
 */
import { eq, sql, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { jobApplications, type ApplicationStatus } from '../db/schema.js';
import type {
  AnalyticsResponse,
  ApplicationsByStatus,
  ApplicationsOverTime,
  AverageTimePerStage,
} from '../schemas/analytics.js';

/**
 * Get analytics data for dashboard for a specific user
 */
export async function getAnalytics(userId: string): Promise<AnalyticsResponse> {
  // Total applications for user
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId));
  const total = Number(totalResult[0]?.count || 0);

  // Applications by status for user
  const statusCountsResult = await db
    .select({
      status: jobApplications.status,
      count: sql<number>`count(*)`,
    })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .groupBy(jobApplications.status);

  const byStatus: ApplicationsByStatus = {
    Applied: 0,
    Interviewing: 0,
    Offer: 0,
    Rejected: 0,
  };

  for (const row of statusCountsResult) {
    byStatus[row.status as ApplicationStatus] = Number(row.count);
  }

  // Applications over time (by month) for user
  const appsOverTimeResult = await db
    .select({
      month: sql<string>`to_char(${jobApplications.applicationDate}, 'YYYY-MM')`,
      count: sql<number>`count(*)`,
    })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .groupBy(sql`to_char(${jobApplications.applicationDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${jobApplications.applicationDate}, 'YYYY-MM')`);

  const applicationsOverTime: ApplicationsOverTime[] = appsOverTimeResult.map((row) => ({
    date: row.month,
    count: Number(row.count),
  }));

  // Average time per stage (simplified calculation) for user
  const avgTime = await calculateAverageTimePerStage(userId);

  // Success rate (offers / total)
  const successRate = total > 0 ? byStatus.Offer / total : 0.0;

  return {
    total_applications: total,
    by_status: byStatus,
    applications_over_time: applicationsOverTime,
    average_time_per_stage: avgTime,
    success_rate: Math.round(successRate * 1000) / 1000, // Round to 3 decimal places
  };
}

/**
 * Calculate average time spent in each stage for a specific user
 *
 * Note: This is a simplified calculation based on current status.
 * For accurate tracking, you'd need to store status change history.
 */
async function calculateAverageTimePerStage(userId: string): Promise<AverageTimePerStage> {
  const now = new Date();

  // Average days in Applied status for user
  const appliedApps = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.userId, userId), eq(jobApplications.status, 'Applied')));

  let avgApplied = 0.0;
  if (appliedApps.length > 0) {
    const totalDays = appliedApps.reduce((sum: number, app) => {
      const days = (now.getTime() - app.applicationDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    avgApplied = totalDays / appliedApps.length;
  }

  // Average days in Interviewing status for user
  const interviewingApps = await db
    .select()
    .from(jobApplications)
    .where(
      and(eq(jobApplications.userId, userId), eq(jobApplications.status, 'Interviewing'))
    );

  let avgInterviewing = 0.0;
  if (interviewingApps.length > 0) {
    const totalDays = interviewingApps.reduce((sum: number, app) => {
      const days = (now.getTime() - app.applicationDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    avgInterviewing = totalDays / interviewingApps.length;
  }

  return {
    Applied: Math.round(avgApplied * 10) / 10, // Round to 1 decimal place
    Interviewing: Math.round(avgInterviewing * 10) / 10,
  };
}
