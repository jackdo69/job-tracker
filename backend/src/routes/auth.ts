/**
 * Authentication API routes
 */
import { Hono, Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, type AuthContext } from '../middleware/auth.js';
import { registerUser, authenticateUser } from '../services/auth-service.js';
import { userCreateSchema, loginRequestSchema } from '../schemas/user.js';

const auth = new Hono();

/**
 * Register a new user
 * POST /auth/register
 */
auth.post('/register', zValidator('json', userCreateSchema), async (c) => {
  const userData = c.req.valid('json');

  try {
    const user = await registerUser(userData);
    return c.json(user, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Authenticate user and return access token
 * POST /auth/login
 */
auth.post('/login', zValidator('json', loginRequestSchema), async (c) => {
  const loginData = c.req.valid('json');

  try {
    const response = await authenticateUser(loginData);
    return c.json(response);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Get current authenticated user information
 * GET /auth/me
 */
auth.get('/me', authMiddleware, async (c: Context<AuthContext>) => {
  const user = c.get('user');

  return c.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

/**
 * TODO: Implement Google OAuth routes
 * GET /auth/google/login
 * GET /auth/google/callback
 */

export default auth;
