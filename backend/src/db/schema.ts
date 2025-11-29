/**
 * Database schema definitions using Drizzle ORM
 */
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, index } from 'drizzle-orm/pg-core';

/**
 * Application status enum
 */
export const applicationStatusEnum = pgEnum('status_enum', [
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Cancelled',
]);

/**
 * Users table
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * Companies table
 */
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  logo: varchar('logo', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('companies_user_id_idx').on(table.userId),
}));

/**
 * Job applications table
 */
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'set null' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  positionTitle: varchar('position_title', { length: 255 }).notNull(),
  status: applicationStatusEnum('status').notNull().default('Applied'),
  interviewStage: varchar('interview_stage', { length: 100 }),
  rejectionStage: varchar('rejection_stage', { length: 100 }),
  applicationDate: timestamp('application_date', { mode: 'date' }).notNull(),
  salaryRange: varchar('salary_range', { length: 100 }),
  location: varchar('location', { length: 255 }),
  notes: text('notes'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  companyIdIdx: index('job_applications_company_id_idx').on(table.companyId),
}));

/**
 * OAuth sessions table for temporary token exchange
 * Stores short-lived codes for mobile-friendly OAuth flow
 */
export const oauthSessions = pgTable('oauth_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  accessToken: text('access_token').notNull(),
  userId: uuid('user_id').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => ({
  codeIdx: index('oauth_sessions_code_idx').on(table.code),
  expiresAtIdx: index('oauth_sessions_expires_at_idx').on(table.expiresAt),
}));

/**
 * TypeScript types inferred from schema
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;

export type OAuthSession = typeof oauthSessions.$inferSelect;
export type NewOAuthSession = typeof oauthSessions.$inferInsert;

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Cancelled';
