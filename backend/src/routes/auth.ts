/**
 * Authentication API routes
 */
import { Hono, Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, type AuthContext } from '../middleware/auth.js';
import { registerUser, authenticateUser, getGoogleAuthUrl, handleGoogleCallback, exchangeOAuthCode } from '../services/auth-service.js';
import { userCreateSchema, loginRequestSchema } from '../schemas/user.js';
import { config } from '../lib/config.js';
import { logger } from '../lib/logger.js';

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
auth.get('/me', authMiddleware, (c: Context<AuthContext>) => {
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
 * Get Google OAuth authorization URL
 * GET /auth/google/login
 */
auth.get('/google/login', (c) => {
  if (!config.googleClientId || !config.googleRedirectUri) {
    throw new HTTPException(500, { message: 'Google OAuth not configured' });
  }

  const authUrl = getGoogleAuthUrl(config.googleClientId, config.googleRedirectUri);
  return c.json({ auth_url: authUrl });
});

/**
 * Handle Google OAuth callback
 * GET /auth/google/callback
 */
auth.get('/google/callback', async (c) => {
  const code = c.req.query('code');

  if (!code) {
    throw new HTTPException(400, { message: 'Authorization code is required' });
  }

  // Debug logging for OAuth config
  logger.debug({
    hasClientId: !!config.googleClientId,
    hasClientSecret: !!config.googleClientSecret,
    hasRedirectUri: !!config.googleRedirectUri,
    redirectUri: config.googleRedirectUri
  }, 'Google OAuth callback configuration check');

  if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
    logger.error({
      hasClientId: !!config.googleClientId,
      hasClientSecret: !!config.googleClientSecret,
      hasRedirectUri: !!config.googleRedirectUri
    }, 'Google OAuth configuration incomplete');
    throw new HTTPException(500, { message: 'Google OAuth not configured' });
  }

  try {
    const response = await handleGoogleCallback(
      code,
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri
    );

    // Redirect to frontend with short exchange code instead of full JWT token
    // This is more reliable on mobile browsers which may truncate long URLs
    const redirectUrl = `${config.frontendUrl}/auth/google/callback?code=${response.exchangeCode}`;
    return c.redirect(redirectUrl);
  } catch (error) {
    if (error instanceof HTTPException) {
      // Redirect to frontend with error
      const errorRedirectUrl = `${config.frontendUrl}/auth/google/callback?error=${encodeURIComponent(error.message)}`;
      return c.redirect(errorRedirectUrl);
    }
    // Log the actual error for debugging
    logger.error({ err: error, code }, 'Google OAuth callback failed');
    const errorRedirectUrl = `${config.frontendUrl}/auth/google/callback?error=Authentication failed`;
    return c.redirect(errorRedirectUrl);
  }
});

/**
 * Exchange OAuth code for access token
 * POST /auth/google/exchange
 */
auth.post('/google/exchange', async (c) => {
  const { code } = await c.req.json<{ code: string }>();

  if (!code) {
    throw new HTTPException(400, { message: 'Exchange code is required' });
  }

  try {
    const response = await exchangeOAuthCode(code);
    return c.json(response);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to exchange code' });
  }
});

export default auth;
