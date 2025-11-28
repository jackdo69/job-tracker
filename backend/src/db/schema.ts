/**
 * Database schema definitions using Drizzle ORM
 */
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

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
 * Job applications table
 */
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
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
});

/**
 * TypeScript types inferred from schema
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Cancelled';
