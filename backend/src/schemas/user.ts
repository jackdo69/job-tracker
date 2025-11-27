/**
 * Zod schemas for user and authentication validation
 */
import { z } from 'zod';

/**
 * Base user schema
 */
export const userBaseSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
});

/**
 * Schema for creating a new user (registration)
 */
export const userCreateSchema = userBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Schema for updating user information
 */
export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  password: z.string().min(8).optional(),
});

/**
 * Schema for user response (excludes password)
 */
export const userResponseSchema = userBaseSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * JWT token response schema
 */
export const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('bearer'),
});

/**
 * Schema for data encoded in JWT token
 */
export const tokenDataSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().optional(),
});

/**
 * Schema for login request
 */
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * Schema for login response
 */
export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('bearer'),
  user: userResponseSchema,
});

/**
 * TypeScript types from Zod schemas (for internal use only)
 * Use types from @jackdo69/job-tracker-shared-types for API contracts
 */
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type TokenData = z.infer<typeof tokenDataSchema>;
