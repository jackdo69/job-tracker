/**
 * Main entry point for Job Tracker API
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { config } from './lib/config.js';
import { sql } from './db/db.js';
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import analyticsRoutes from './routes/analytics.js';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: config.corsOrigins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes
app.route(`${config.apiPrefix}/auth`, authRoutes);
app.route(`${config.apiPrefix}/applications`, applicationsRoutes);
app.route(`${config.apiPrefix}/analytics`, analyticsRoutes);

/**
 * Root endpoint
 */
app.get('/', (c) => {
  console.log('Root endpoint accessed');
  return c.json({
    name: config.projectName,
    version: config.version,
    docs: `${config.apiPrefix}/docs`,
  });
});

/**
 * Health check endpoint (simple)
 */
app.get('/health', (c) => {
  console.log('Health check requested');
  return c.json({
    status: 'healthy',
    service: 'job-tracker-api',
    version: config.version,
  });
});

/**
 * Database health check endpoint
 */
app.get('/health/db', async (c) => {
  console.log('Database health check requested');

  try {
    // Test database connection with a simple query
    await sql`SELECT 1`;
    console.log('Database health check passed');

    return c.json({
      status: 'healthy',
      service: 'job-tracker-api',
      version: config.version,
      database: 'connected',
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    throw new HTTPException(503, {
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

/**
 * API v1 health check endpoint
 */
app.get(`${config.apiPrefix}/health`, (c) => {
  console.log('API health check accessed');
  return c.json({
    status: 'healthy',
    service: 'job-tracker-api',
  });
});

/**
 * Error handler
 */
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error('Unhandled error:', err);
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
console.log('='.repeat(50));
console.log('Starting server...');
console.log(`Service: ${config.projectName}`);
console.log(`Version: ${config.version}`);
console.log(`PORT: ${port}`);
console.log(`DATABASE_URL: ${config.databaseUrl ? 'SET' : 'NOT SET'}`);
console.log('='.repeat(50));

serve(
  {
    fetch: app.fetch,
    port,
    hostname: config.host,
  },
  (info) => {
    console.log('='.repeat(50));
    console.log('Application startup complete!');
    console.log(`Service: ${config.projectName}`);
    console.log(`Version: ${config.version}`);
    console.log(`Server running at http://${info.address}:${info.port}`);
    console.log('='.repeat(50));
  }
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('='.repeat(50));
  console.log('SIGTERM signal received: closing HTTP server');
  console.log('='.repeat(50));
  await sql.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('='.repeat(50));
  console.log('SIGINT signal received: closing HTTP server');
  console.log('='.repeat(50));
  await sql.end();
  process.exit(0);
});
