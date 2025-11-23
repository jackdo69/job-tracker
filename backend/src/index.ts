/**
 * Main entry point for Job Tracker API
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';
import { requestLogger } from './middleware/logger.js';
import { sql } from './db/db.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import analyticsRoutes from './routes/analytics.js';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', requestLogger);
app.use(
  '*',
  cors({
    origin: config.corsOrigins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Public routes (no authentication required)
app.route('/', healthRoutes);

// Protected routes (authentication required)
app.route(`${config.apiPrefix}/auth`, authRoutes);
app.route(`${config.apiPrefix}/applications`, applicationsRoutes);
app.route(`${config.apiPrefix}/analytics`, analyticsRoutes);

/**
 * Error handler
 */
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Log HTTP exceptions at appropriate level
    const status = err.status;
    if (status >= 500) {
      logger.error({ err, status }, `HTTP Error: ${err.message}`);
    } else if (status >= 400) {
      logger.warn({ status, message: err.message }, `HTTP ${status}: ${err.message}`);
    }
    return err.getResponse();
  }

  // Log unhandled errors
  logger.error({ err }, `Unhandled error: ${err.message}`);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested resource was not found',
    },
    404
  );
});

// Start server
const port = config.port;

logger.info('='.repeat(60));
logger.info('🚀 Starting Job Tracker API...');
logger.info('='.repeat(60));
logger.info({ service: config.projectName, version: config.version }, 'Service Information');
logger.info({ port, host: config.host }, 'Server Configuration');
logger.info({
  databaseConfigured: !!config.databaseUrl,
  corsOrigins: config.corsOrigins
}, 'Database & CORS Configuration');
logger.info('='.repeat(60));

serve(
  {
    fetch: app.fetch,
    port,
    hostname: config.host,
  },
  (info) => {
    logger.info('='.repeat(60));
    logger.info('✅ Application startup complete!');
    logger.info({
      service: config.projectName,
      version: config.version,
      url: `http://${info.address}:${info.port}`,
      apiPrefix: config.apiPrefix,
      healthCheck: `http://${info.address}:${info.port}/health`,
      dbHealthCheck: `http://${info.address}:${info.port}/health/db`,
    }, 'Server is running');
    logger.info('='.repeat(60));
    logger.info('📝 Ready to accept requests');
  }
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.warn('='.repeat(60));
  logger.warn('⚠️  SIGTERM signal received: initiating graceful shutdown');
  logger.warn('='.repeat(60));

  try {
    logger.info('Closing database connections...');
    await sql.end();
    logger.info('✅ Database connections closed successfully');
    logger.info('👋 Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Error during shutdown');
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.warn('='.repeat(60));
  logger.warn('⚠️  SIGINT signal received: initiating graceful shutdown');
  logger.warn('='.repeat(60));

  try {
    logger.info('Closing database connections...');
    await sql.end();
    logger.info('✅ Database connections closed successfully');
    logger.info('👋 Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Error during shutdown');
    process.exit(1);
  }
});
