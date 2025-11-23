/**
 * Zod schemas for job application validation
 */
import { z } from 'zod';

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
 * TypeScript types from Zod schemas
 */
export type JobApplicationCreate = z.infer<typeof jobApplicationCreateSchema>;
export type JobApplicationUpdate = z.infer<typeof jobApplicationUpdateSchema>;
export type JobApplicationMove = z.infer<typeof jobApplicationMoveSchema>;
export type JobApplicationResponse = z.infer<typeof jobApplicationResponseSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
