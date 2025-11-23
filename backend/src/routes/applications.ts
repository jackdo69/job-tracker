/**
 * Job applications API routes
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
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

const applications = new Hono<AuthContext>();

// Apply auth middleware to all routes
applications.use('/*', authMiddleware);

/**
 * List all job applications for the current user
 * GET /applications
 */
applications.get('/', async (c) => {
  const user = c.get('user');
  const apps = await getAllApplications(user.id);
  return c.json(apps);
});

/**
 * Create a new job application for the current user
 * POST /applications
 */
applications.post('/', zValidator('json', jobApplicationCreateSchema), async (c) => {
  const user = c.get('user');
  const applicationData = c.req.valid('json');

  try {
    const app = await createApplication(applicationData, user.id);
    return c.json(app, 201);
  } catch (error) {
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

  const app = await getApplicationById(applicationId, user.id);
  if (!app) {
    throw new HTTPException(404, { message: `Application ${applicationId} not found` });
  }

  return c.json(app);
});

/**
 * Update a job application for the current user
 * PUT /applications/:id
 */
applications.put('/:id', zValidator('json', jobApplicationUpdateSchema), async (c) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');
  const applicationData = c.req.valid('json');

  try {
    const updated = await updateApplication(applicationId, applicationData, user.id);
    if (!updated) {
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    return c.json(updated);
  } catch (error) {
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
    const deleted = await deleteApplication(applicationId, user.id);
    if (!deleted) {
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    return c.body(null, 204);
  } catch (error) {
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
applications.patch('/:id/move', zValidator('json', jobApplicationMoveSchema), async (c) => {
  const user = c.get('user');
  const applicationId = c.req.param('id');
  const moveData = c.req.valid('json');

  try {
    const moved = await moveApplication(applicationId, moveData, user.id);
    if (!moved) {
      throw new HTTPException(404, { message: `Application ${applicationId} not found` });
    }

    return c.json(moved);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export default applications;
