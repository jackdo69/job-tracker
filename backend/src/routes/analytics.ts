/**
 * Analytics API routes
 */
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, type AuthContext } from '../middleware/auth.js';
import { getAnalytics } from '../services/analytics-service.js';

const analytics = new Hono<AuthContext>();

// Apply auth middleware to all routes
analytics.use('/*', authMiddleware);

/**
 * Get analytics data for dashboard for the current user
 * GET /analytics
 */
analytics.get('/', async (c) => {
  const user = c.get('user');

  try {
    const data = await getAnalytics(user.id);
    return c.json(data);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

export default analytics;
