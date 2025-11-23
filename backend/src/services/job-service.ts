/**
 * Business logic for job applications
 */
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { jobApplications, type JobApplication, type ApplicationStatus } from '../db/schema.js';
import type {
  JobApplicationCreate,
  JobApplicationUpdate,
  JobApplicationMove,
} from '../schemas/job-application.js';
import { logger } from '../lib/logger.js';

/**
 * Get all job applications for a specific user
 */
export async function getAllApplications(userId: string): Promise<JobApplication[]> {
  return db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .orderBy(jobApplications.status, jobApplications.orderIndex);
}

/**
 * Get job application by ID for a specific user
 */
export async function getApplicationById(
  applicationId: string,
  userId: string
): Promise<JobApplication | undefined> {
  const result = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .limit(1);

  return result[0];
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

    const orderIndex = maxOrderResult.length > 0 ? (maxOrderResult[0].maxOrder ?? -1) + 1 : 0;

    // Transform snake_case to camelCase for Drizzle ORM
    // Ensure date is a proper Date object
    const applicationDate = applicationData.application_date instanceof Date
      ? applicationData.application_date
      : new Date(applicationData.application_date);

    const insertData = {
      companyName: applicationData.company_name,
      positionTitle: applicationData.position_title,
      status: applicationData.status,
      interviewStage: applicationData.interview_stage ?? null,
      rejectionStage: applicationData.rejection_stage ?? null,
      applicationDate,
      salaryRange: applicationData.salary_range ?? null,
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

  // Transform snake_case to camelCase for Drizzle ORM
  const updateData: Partial<JobApplication> = {};
  if (applicationData.company_name !== undefined) updateData.companyName = applicationData.company_name;
  if (applicationData.position_title !== undefined) updateData.positionTitle = applicationData.position_title;
  if (applicationData.status !== undefined) updateData.status = applicationData.status;
  if (applicationData.interview_stage !== undefined) updateData.interviewStage = applicationData.interview_stage;
  if (applicationData.rejection_stage !== undefined) updateData.rejectionStage = applicationData.rejection_stage;
  if (applicationData.application_date !== undefined) updateData.applicationDate = applicationData.application_date;
  if (applicationData.salary_range !== undefined) updateData.salaryRange = applicationData.salary_range;
  if (applicationData.location !== undefined) updateData.location = applicationData.location;
  if (applicationData.notes !== undefined) updateData.notes = applicationData.notes;
  if (applicationData.order_index !== undefined) updateData.orderIndex = applicationData.order_index;

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
  const newStatus = moveData.status;

  // Prepare update data (transform snake_case to camelCase)
  const updateData: Partial<JobApplication> = {
    status: newStatus,
    orderIndex: moveData.order_index,
  };

  // Update stage fields based on status
  if (newStatus === 'Interviewing') {
    updateData.interviewStage = moveData.interview_stage ?? null;
    updateData.rejectionStage = null;
  } else if (newStatus === 'Rejected') {
    updateData.rejectionStage = moveData.rejection_stage ?? null;
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
          sql`${jobApplications.orderIndex} >= ${moveData.order_index}`,
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
