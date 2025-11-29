/**
 * Zod schemas for job application validation
 */
import { z } from 'zod';
import { ApplicationStatus } from '@jackdo69/job-tracker-shared-types';

/**
 * Application status enum
 */
export const applicationStatusSchema = z.nativeEnum(ApplicationStatus);

/**
 * Base job application schema
 */
export const jobApplicationBaseSchema = z.object({
  companyName: z.string().min(1).max(255),
  positionTitle: z.string().min(1).max(255),
  status: applicationStatusSchema.default(ApplicationStatus.APPLIED),
  interviewStage: z.string().max(100).optional().nullable(),
  rejectionStage: z.string().max(100).optional().nullable(),
  applicationDate: z.string(),
  salaryRange: z.string().max(100).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
});

/**
 * Schema for creating a job application
 */
export const jobApplicationCreateSchema = jobApplicationBaseSchema;

/**
 * Schema for updating a job application
 */
export const jobApplicationUpdateSchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  positionTitle: z.string().min(1).max(255).optional(),
  status: applicationStatusSchema.optional(),
  interviewStage: z.string().max(100).optional().nullable(),
  rejectionStage: z.string().max(100).optional().nullable(),
  applicationDate: z.string().optional(),
  salaryRange: z.string().max(100).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
});

/**
 * Schema for moving a job application (drag-drop)
 */
export const jobApplicationMoveSchema = z.object({
  status: applicationStatusSchema,
  orderIndex: z.number().int().min(0),
  interviewStage: z.string().max(100).optional().nullable(),
  rejectionStage: z.string().max(100).optional().nullable(),
});

/**
 * Schema for job application response
 */
export const jobApplicationResponseSchema = jobApplicationBaseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * TypeScript types from Zod schemas (for internal validation use only)
 * Use types from @jackdo69/job-tracker-shared-types for application logic
 */
export type JobApplicationResponse = z.infer<typeof jobApplicationResponseSchema>;
