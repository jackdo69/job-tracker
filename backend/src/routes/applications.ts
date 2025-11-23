/**
 * Job applications API routes
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { authMiddleware, type AuthContext } from '../middleware/auth.js';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  moveApplication,
} from '../services/job-service.js';
import {
  jobApplicationCreateSchema,
  jobApplicationUpdateSchema,
  jobApplicationMoveSchema,
} from '../schemas/job-application.js';
import { logger } from '../lib/logger.js';

const applications = new Hono<AuthContext>();

// Apply auth middleware to all routes
applications.use('/*', authMiddleware);

/**
 * List all job applications for the current user
 * GET /applications
 */
applications.get('/', async (c) => {
  const user = c.get('user');

  try {
    logger.debug({
      userId: user.id
    }, 'Fetching all job applications');

    const apps = await getAllApplications(user.id);

    logger.debug({
      userId: user.id,
      count: apps.length
    }, 'Fetched job applications successfully');

    return c.json(apps);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id
    }, 'Failed to fetch job applications');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Create a new job application for the current user
 * POST /applications
 */
applications.post('/', zValidator('json', jobApplicationCreateSchema, (result, c) => {
  if (!result.success) {
    logger.error({
      error: result.error,
      issues: result.error.issues,
      path: '/applications',
      method: 'POST'
    }, 'Validation failed for create application');

    return c.json({
      error: 'Validation failed',
      details: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }, 400);
  }
}), async (c) => {
  const user = c.get('user');
  const applicationData = c.req.valid('json');

  try {
    logger.info({
      userId: user.id,
      data: applicationData
    }, 'Creating job application');

    const app = await createApplication(applicationData, user.id);

    logger.info({
      userId: user.id,
      applicationId: app.id
    }, 'Job application created successfully');

    return c.json(app, 201);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      data: applicationData
    }, 'Failed to create job application');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Get a single job application by ID for the current user
 * GET /applications/:id
 */
applications.get('/:id', async (c) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');

  try {
    logger.debug({
      userId: user.id,
      applicationId
    }, 'Fetching job application by ID');

    const app = await getApplicationById(applicationId, user.id);
    if (!app) {
      logger.warn({
        userId: user.id,
        applicationId
      }, 'Application not found');
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    logger.debug({
      userId: user.id,
      applicationId
    }, 'Fetched job application successfully');

    return c.json(app);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      applicationId
    }, 'Failed to fetch job application');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Update a job application for the current user
 * PUT /applications/:id
 */
applications.put('/:id', zValidator('json', jobApplicationUpdateSchema, (result, c) => {
  if (!result.success) {
    logger.error({
      error: result.error,
      issues: result.error.issues,
      path: '/applications/:id',
      method: 'PUT'
    }, 'Validation failed for update application');

    return c.json({
      error: 'Validation failed',
      details: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }, 400);
  }
}), async (c) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');
  const applicationData = c.req.valid('json');

  try {
    logger.info({
      userId: user.id,
      applicationId,
      data: applicationData
    }, 'Updating job application');

    const updated = await updateApplication(applicationId, applicationData, user.id);
    if (!updated) {
      logger.warn({
        userId: user.id,
        applicationId
      }, 'Application not found for update');
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    logger.info({
      userId: user.id,
      applicationId
    }, 'Job application updated successfully');

    return c.json(updated);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      applicationId,
      data: applicationData
    }, 'Failed to update job application');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Delete a job application for the current user
 * DELETE /applications/:id
 */
applications.delete('/:id', async (c) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');

  try {
    logger.info({
      userId: user.id,
      applicationId
    }, 'Deleting job application');

    const deleted = await deleteApplication(applicationId, user.id);
    if (!deleted) {
      logger.warn({
        userId: user.id,
        applicationId
      }, 'Application not found for deletion');
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    logger.info({
      userId: user.id,
      applicationId
    }, 'Job application deleted successfully');

    return c.body(null, 204);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      applicationId
    }, 'Failed to delete job application');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Move application to a new status (for drag-drop) for the current user
 * PATCH /applications/:id/move
 */
applications.patch('/:id/move', zValidator('json', jobApplicationMoveSchema, (result, c) => {
  if (!result.success) {
    logger.error({
      error: result.error,
      issues: result.error.issues,
      path: '/applications/:id/move',
      method: 'PATCH'
    }, 'Validation failed for move application');

    return c.json({
      error: 'Validation failed',
      details: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }, 400);
  }
}), async (c) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');
  const moveData = c.req.valid('json');

  try {
    logger.info({
      userId: user.id,
      applicationId,
      moveData
    }, 'Moving job application');

    const moved = await moveApplication(applicationId, moveData, user.id);
    if (!moved) {
      logger.warn({
        userId: user.id,
        applicationId
      }, 'Application not found for move');
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    logger.info({
      userId: user.id,
      applicationId,
      newStatus: moveData.status
    }, 'Job application moved successfully');

    return c.json(moved);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      applicationId,
      moveData
    }, 'Failed to move job application');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export default applications;
