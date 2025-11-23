/**
 * Request/Response logging middleware for Hono
 */
import { Context, Next } from 'hono';
import { logger } from '../lib/logger.js';

/**
 * Middleware to log HTTP requests and responses with duration
 */
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('user-agent') || 'unknown';

  // Log incoming request
  logger.info({
    type: 'request',
    method,
    path,
    userAgent,
  }, `→ ${method} ${path}`);

  // Process request
  await next();

  // Calculate duration
  const duration = Date.now() - start;
  const status = c.res.status;

  // Determine log level based on status code
  const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

  // Log response
  logger[logLevel]({
    type: 'response',
    method,
    path,
    status,
    duration: `${duration}ms`,
    durationMs: duration,
  }, `← ${method} ${path} ${status} (${duration}ms)`);

  return c.res;
}
