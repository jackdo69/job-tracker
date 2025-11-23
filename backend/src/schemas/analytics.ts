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
  total_applications: z.number().int(),
  by_status: applicationsByStatusSchema,
  applications_over_time: z.array(applicationsOverTimeSchema),
  average_time_per_stage: averageTimePerStageSchema,
  success_rate: z.number(), // Offers / Total applications
});

/**
 * TypeScript types from Zod schemas
 */
export type ApplicationsByStatus = z.infer<typeof applicationsByStatusSchema>;
export type ApplicationsOverTime = z.infer<typeof applicationsOverTimeSchema>;
export type AverageTimePerStage = z.infer<typeof averageTimePerStageSchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
