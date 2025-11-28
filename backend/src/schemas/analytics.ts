/**
 * Zod schemas for analytics validation
 */
import { z } from 'zod';

/**
 * Count of applications by status
 */
export const applicationsByStatusSchema = z.object({
  Applied: z.number().int().default(0),
  Interviewing: z.number().int().default(0),
  Offer: z.number().int().default(0),
  Rejected: z.number().int().default(0),
});

/**
 * Applications count over time
 */
export const applicationsOverTimeSchema = z.object({
  date: z.string(), // Format: YYYY-MM
  count: z.number().int(),
});

/**
 * Average days spent in each stage
 */
export const averageTimePerStageSchema = z.object({
  Applied: z.number().default(0.0),
  Interviewing: z.number().default(0.0),
});

/**
 * Analytics dashboard response
 */
export const analyticsResponseSchema = z.object({
  totalApplications: z.number().int(),
  byStatus: applicationsByStatusSchema,
  applicationsOverTime: z.array(applicationsOverTimeSchema),
  averageTimePerStage: averageTimePerStageSchema,
  successRate: z.number(), // Offers / Total applications
});

/**
 * TypeScript types from Zod schemas (for validation only)
 * Use types from @jackdo69/job-tracker-shared-types for application logic
 */
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
