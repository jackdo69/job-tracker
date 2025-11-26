/**
 * Zod schemas for job application validation
 */
import { z } from 'zod';
import type { ApplicationStatus } from '@jackdo69/job-tracker-shared-types';

/**
 * Application status enum
 */
export const applicationStatusSchema = z.enum(['Applied', 'Interviewing', 'Offer', 'Rejected']);

/**
 * Base job application schema
 */
export const jobApplicationBaseSchema = z.object({
  company_name: z.string().min(1).max(255),
  position_title: z.string().min(1).max(255),
  status: applicationStatusSchema.default('Applied'),
  interview_stage: z.string().max(100).optional().nullable(),
  rejection_stage: z.string().max(100).optional().nullable(),
  application_date: z.coerce.date(),
  salary_range: z.string().max(100).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  order_index: z.number().int().min(0).default(0),
});

/**
 * Schema for creating a job application
 */
export const jobApplicationCreateSchema = jobApplicationBaseSchema;

/**
 * Schema for updating a job application
 */
export const jobApplicationUpdateSchema = z.object({
  company_name: z.string().min(1).max(255).optional(),
  position_title: z.string().min(1).max(255).optional(),
  status: applicationStatusSchema.optional(),
  interview_stage: z.string().max(100).optional().nullable(),
  rejection_stage: z.string().max(100).optional().nullable(),
  application_date: z.coerce.date().optional(),
  salary_range: z.string().max(100).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  order_index: z.number().int().min(0).optional(),
});

/**
 * Schema for moving a job application (drag-drop)
 */
export const jobApplicationMoveSchema = z.object({
  status: applicationStatusSchema,
  order_index: z.number().int().min(0),
  interview_stage: z.string().max(100).optional().nullable(),
  rejection_stage: z.string().max(100).optional().nullable(),
});

/**
 * Schema for job application response
 */
export const jobApplicationResponseSchema = jobApplicationBaseSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

/**
 * TypeScript types from Zod schemas (for internal validation use only)
 * Use types from @jackdo69/job-tracker-shared-types for application logic
 */
export type JobApplicationResponse = z.infer<typeof jobApplicationResponseSchema>;
