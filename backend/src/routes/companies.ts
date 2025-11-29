/**
 * Companies API routes
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, type AuthContext } from '../middleware/auth.js';
import { handleFileUpload } from '../middleware/upload.js';
import {
  createCompany,
  getCompaniesByUser,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../services/companyService.js';
import {
  companyCreateSchema,
  companyUpdateSchema,
  companyIdParamSchema,
} from '../schemas/company.js';
import { logger } from '../lib/logger.js';

const companies = new Hono<AuthContext>();

// Apply auth middleware to all routes
companies.use('/*', authMiddleware);

/**
 * List all companies for the current user
 * GET /companies
 */
companies.get('/', async (c) => {
  const user = c.get('user');

  try {
    logger.debug({
      userId: user.id
    }, 'Fetching all companies');

    const companiesList = await getCompaniesByUser(user.id);

    logger.debug({
      userId: user.id,
      count: companiesList.length
    }, 'Fetched companies successfully');

    return c.json(companiesList);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id
    }, 'Failed to fetch companies');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Create a new company for the current user
 * POST /companies
 * Content-Type: multipart/form-data
 * Fields: name (required), logo (optional file)
 */
companies.post('/', handleFileUpload, async (c) => {
  const user = c.get('user');

  try {
    // Extract form data
    const req = c.req.raw as { file?: { buffer: Buffer } };
    const formData = await c.req.formData();
    const name = formData.get('name') as string;

    // Validate company name
    const validationResult = companyCreateSchema.safeParse({ name });
    if (!validationResult.success) {
      throw new HTTPException(400, {
        message: validationResult.error.issues[0]?.message || 'Invalid input'
      });
    }

    // Get uploaded file (if any)
    const logoBuffer = req.file?.buffer;

    logger.info({
      userId: user.id,
      companyName: name,
      hasLogo: !!logoBuffer
    }, 'Creating company');

    const company = await createCompany(user.id, name, logoBuffer);

    logger.info({
      userId: user.id,
      companyId: company.id
    }, 'Company created successfully');

    return c.json(company, 201);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id
    }, 'Failed to create company');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Get a single company by ID for the current user
 * GET /companies/:id
 */
companies.get('/:id', zValidator('param', companyIdParamSchema), async (c) => {
  const user = c.get('user');
  const { id } = c.req.valid('param');

  try {
    logger.debug({
      userId: user.id,
      companyId: id
    }, 'Fetching company by ID');

    const company = await getCompanyById(id, user.id);
    if (!company) {
      logger.warn({
        userId: user.id,
        companyId: id
      }, 'Company not found');
      throw new HTTPException(404, { message: `Company ${id} not found` });
    }

    logger.debug({
      userId: user.id,
      companyId: id
    }, 'Fetched company successfully');

    return c.json(company);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      companyId: id
    }, 'Failed to fetch company');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Update a company for the current user
 * PUT /companies/:id
 * Content-Type: multipart/form-data
 * Fields: name (optional), logo (optional file)
 */
companies.put('/:id', handleFileUpload, async (c) => {
  const user = c.get('user');
  const companyId = c.req.param('id');

  try {
    // Validate company ID
    const paramValidation = companyIdParamSchema.safeParse({ id: companyId });
    if (!paramValidation.success) {
      throw new HTTPException(400, { message: 'Invalid company ID' });
    }

    // Extract form data
    const req = c.req.raw as { file?: { buffer: Buffer } };
    const formData = await c.req.formData();
    const name = formData.get('name') as string | null;

    // Validate company name if provided
    if (name !== null && name !== undefined) {
      const validationResult = companyUpdateSchema.safeParse({ name });
      if (!validationResult.success) {
        throw new HTTPException(400, {
          message: validationResult.error.issues[0]?.message || 'Invalid input'
        });
      }
    }

    // Get uploaded file (if any)
    const logoBuffer = req.file?.buffer;

    logger.info({
      userId: user.id,
      companyId,
      hasName: !!name,
      hasLogo: !!logoBuffer
    }, 'Updating company');

    const updated = await updateCompany(
      companyId,
      user.id,
      name || undefined,
      logoBuffer
    );

    if (!updated) {
      logger.warn({
        userId: user.id,
        companyId
      }, 'Company not found for update');
      throw new HTTPException(404, { message: `Company ${companyId} not found` });
    }

    logger.info({
      userId: user.id,
      companyId
    }, 'Company updated successfully');

    return c.json(updated);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      companyId
    }, 'Failed to update company');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Delete a company for the current user
 * DELETE /companies/:id
 */
companies.delete('/:id', zValidator('param', companyIdParamSchema), async (c) => {
  const user = c.get('user');
  const { id } = c.req.valid('param');

  try {
    logger.info({
      userId: user.id,
      companyId: id
    }, 'Deleting company');

    const deleted = await deleteCompany(id, user.id);
    if (!deleted) {
      logger.warn({
        userId: user.id,
        companyId: id
      }, 'Company not found for deletion');
      throw new HTTPException(404, { message: `Company ${id} not found` });
    }

    logger.info({
      userId: user.id,
      companyId: id
    }, 'Company deleted successfully');

    return c.body(null, 204);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      companyId: id
    }, 'Failed to delete company');

    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export default companies;
