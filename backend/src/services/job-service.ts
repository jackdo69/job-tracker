/**
 * Business logic for job applications
 */
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { jobApplications, companies, type JobApplication, type ApplicationStatus, type Company } from '../db/schema.js';
import type {
  JobApplicationCreate,
  JobApplicationUpdate,
  JobApplicationMove,
} from '@jackdo69/job-tracker-shared-types';
import { ApplicationStatus as ApplicationStatusEnum } from '@jackdo69/job-tracker-shared-types';
import { logger } from '../lib/logger.js';

/**
 * Extended job application with company data
 */
export interface JobApplicationWithCompany extends JobApplication {
  company?: Company | null;
}

/**
 * Get all job applications for a specific user
 * Includes company data if company_id is set
 */
export async function getAllApplications(userId: string): Promise<JobApplicationWithCompany[]> {
  const results = await db
    .select({
      application: jobApplications,
      company: companies,
    })
    .from(jobApplications)
    .leftJoin(companies, eq(jobApplications.companyId, companies.id))
    .where(eq(jobApplications.userId, userId))
    .orderBy(jobApplications.status, jobApplications.orderIndex);

  return results.map((result) => ({
    ...result.application,
    company: result.company,
  }));
}

/**
 * Get job application by ID for a specific user
 * Includes company data if company_id is set
 */
export async function getApplicationById(
  applicationId: string,
  userId: string
): Promise<JobApplicationWithCompany | undefined> {
  const result = await db
    .select({
      application: jobApplications,
      company: companies,
    })
    .from(jobApplications)
    .leftJoin(companies, eq(jobApplications.companyId, companies.id))
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .limit(1);

  if (!result[0]) {
    return undefined;
  }

  return {
    ...result[0].application,
    company: result[0].company,
  };
}

/**
 * Create new job application for a specific user
 */
export async function createApplication(
  applicationData: JobApplicationCreate,
  userId: string
): Promise<JobApplication> {
  try {
    // Get max order_index for the status and user
    const maxOrderResult = await db
      .select({ maxOrder: jobApplications.orderIndex })
      .from(jobApplications)
      .where(and(eq(jobApplications.status, applicationData.status), eq(jobApplications.userId, userId)))
      .orderBy(desc(jobApplications.orderIndex))
      .limit(1);

    const orderIndex = applicationData.orderIndex ?? (maxOrderResult.length > 0 ? (maxOrderResult[0].maxOrder ?? -1) + 1 : 0);

    // Ensure date is a proper Date object
    const applicationDate = typeof applicationData.applicationDate === 'string'
      ? new Date(applicationData.applicationDate)
      : applicationData.applicationDate;

    const insertData = {
      companyId: applicationData.companyId ?? null,
      companyName: applicationData.companyName,
      positionTitle: applicationData.positionTitle,
      status: applicationData.status as ApplicationStatus,
      interviewStage: applicationData.interviewStage ?? null,
      rejectionStage: applicationData.rejectionStage ?? null,
      applicationDate,
      salaryRange: applicationData.salaryRange ?? null,
      location: applicationData.location ?? null,
      notes: applicationData.notes ?? null,
      userId,
      orderIndex,
    };

    logger.debug({ insertData }, 'Attempting to insert job application');

    const [newApplication] = await db
      .insert(jobApplications)
      .values(insertData)
      .returning();

    return newApplication;
  } catch (error) {
    logger.error({
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error),
      userId,
      applicationData
    }, 'Database error in createApplication');
    throw error;
  }
}

/**
 * Update job application for a specific user
 */
export async function updateApplication(
  applicationId: string,
  applicationData: JobApplicationUpdate,
  userId: string
): Promise<JobApplication | undefined> {
  const existing = await getApplicationById(applicationId, userId);
  if (!existing) {
    return undefined;
  }

  // Build update data (already in camelCase from shared types)
  const updateData: Partial<JobApplication> = {};
  if (applicationData.companyId !== undefined) updateData.companyId = applicationData.companyId;
  if (applicationData.companyName !== undefined) updateData.companyName = applicationData.companyName;
  if (applicationData.positionTitle !== undefined) updateData.positionTitle = applicationData.positionTitle;
  if (applicationData.status !== undefined) updateData.status = applicationData.status as ApplicationStatus;
  if (applicationData.interviewStage !== undefined) updateData.interviewStage = applicationData.interviewStage;
  if (applicationData.rejectionStage !== undefined) updateData.rejectionStage = applicationData.rejectionStage;
  if (applicationData.applicationDate !== undefined) {
    updateData.applicationDate = typeof applicationData.applicationDate === 'string'
      ? new Date(applicationData.applicationDate)
      : applicationData.applicationDate;
  }
  if (applicationData.salaryRange !== undefined) updateData.salaryRange = applicationData.salaryRange;
  if (applicationData.location !== undefined) updateData.location = applicationData.location;
  if (applicationData.notes !== undefined) updateData.notes = applicationData.notes;
  if (applicationData.orderIndex !== undefined) updateData.orderIndex = applicationData.orderIndex;

  const [updated] = await db
    .update(jobApplications)
    .set(updateData)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .returning();

  return updated;
}

/**
 * Delete job application for a specific user
 */
export async function deleteApplication(
  applicationId: string,
  userId: string
): Promise<boolean> {
  const existing = await getApplicationById(applicationId, userId);
  if (!existing) {
    return false;
  }

  await db
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)));

  return true;
}

/**
 * Move application to new status/position (for drag-drop) for a specific user
 */
export async function moveApplication(
  applicationId: string,
  moveData: JobApplicationMove,
  userId: string
): Promise<JobApplication | undefined> {
  const application = await getApplicationById(applicationId, userId);
  if (!application) {
    return undefined;
  }

  const oldStatus = application.status;
  const newStatus = moveData.status as ApplicationStatus;

  // Prepare update data (already in camelCase from shared types)
  const updateData: Partial<JobApplication> = {
    status: newStatus,
    orderIndex: moveData.orderIndex,
  };

  // Update stage fields based on status
  if (newStatus === ApplicationStatusEnum.INTERVIEWING) {
    updateData.interviewStage = moveData.interviewStage ?? null;
    updateData.rejectionStage = null;
  } else if (newStatus === ApplicationStatusEnum.REJECTED) {
    updateData.rejectionStage = moveData.rejectionStage ?? null;
    updateData.interviewStage = null;
  } else {
    updateData.interviewStage = null;
    updateData.rejectionStage = null;
  }

  // If status changed, reorder other applications (only for this user)
  if (oldStatus !== newStatus) {
    // Get applications that need to be shifted
    const appsToShift = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.userId, userId),
          eq(jobApplications.status, newStatus),
          sql`${jobApplications.orderIndex} >= ${moveData.orderIndex}`,
          sql`${jobApplications.id} != ${applicationId}`
        )
      );

    // Increment order_index for each application
    for (const app of appsToShift) {
      await db
        .update(jobApplications)
        .set({ orderIndex: app.orderIndex + 1 })
        .where(eq(jobApplications.id, app.id));
    }
  }

  const [updated] = await db
    .update(jobApplications)
    .set(updateData)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .returning();

  return updated;
}

/**
 * Get all applications with a specific status for a specific user
 */
export async function getApplicationsByStatus(
  status: ApplicationStatus,
  userId: string
): Promise<JobApplication[]> {
  return db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.status, status), eq(jobApplications.userId, userId)))
    .orderBy(jobApplications.orderIndex);
}
