/**
 * Health check API routes (public, no authentication required)
 */
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../lib/logger.js';
import { config } from '../lib/config.js';
import { sql } from '../db/db.js';

const health = new Hono();

/**
 * Root endpoint
 * GET /
 */
health.get('/', (c) => {
  return c.json({
    name: config.projectName,
    version: config.version,
    docs: `${config.apiPrefix}/docs`,
  });
});

/**
 * Simple health check endpoint
 * GET /health
 */
health.get('/health', (c) => {
  logger.debug('Health check requested');
  return c.json({
    status: 'healthy',
    service: 'job-tracker-api',
    version: config.version,
  });
});

/**
 * Database health check endpoint
 * GET /health/db
 */
health.get('/health/db', async (c) => {
  logger.debug('Database health check requested');

  try {
    // Test database connection with a simple query
    const start = Date.now();
    await sql`SELECT 1`;
    const duration = Date.now() - start;

    logger.info({ duration: `${duration}ms` }, 'Database health check passed');

    return c.json({
      status: 'healthy',
      service: 'job-tracker-api',
      version: config.version,
      database: 'connected',
      responseTime: `${duration}ms`,
    });
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed');
    throw new HTTPException(503, {
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

/**
 * API v1 health check endpoint
 * GET /api/health
 */
health.get(`${config.apiPrefix}/health`, (c) => {
  logger.debug('API health check accessed');
  return c.json({
    status: 'healthy',
    service: 'job-tracker-api',
  });
});

export default health;
