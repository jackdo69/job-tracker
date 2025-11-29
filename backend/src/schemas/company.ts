import { z } from 'zod';

/**
 * Schema for creating a new company
 */
export const companyCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Company name is required')
    .max(255, 'Company name must be less than 255 characters'),
});

/**
 * Schema for updating a company
 * All fields are optional
 */
export const companyUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Company name must not be empty')
    .max(255, 'Company name must be less than 255 characters')
    .optional(),
});

/**
 * Schema for company ID parameter
 */
export const companyIdParamSchema = z.object({
  id: z.string().uuid('Invalid company ID'),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
