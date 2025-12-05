/**
 * Authentication middleware for Hono
 */
import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { decodeAccessToken } from '../lib/auth.js';
import { getCurrentUserFromToken } from '../services/auth-service.js';
import type { User } from '../db/schema.js';
import { sql } from '../db/db.js';

/**
 * Extend Hono context to include user
 */
export type AuthContext = {
  Variables: {
    user: User;
  };
};

/**
 * Middleware to authenticate requests using Bearer token
 */
export async function authMiddleware(c: Context<AuthContext>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      message: 'Missing or invalid authorization header',
      res: new Response(null, {
        headers: { 'WWW-Authenticate': 'Bearer' },
      }),
    });
  }

  // Extract token
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Decode token
  const payload = decodeAccessToken(token);
  if (!payload) {
    throw new HTTPException(401, {
      message: 'Could not validate credentials',
      res: new Response(null, {
        headers: { 'WWW-Authenticate': 'Bearer' },
      }),
    });
  }

  // Extract user ID from token
  const userId = payload.sub as string | undefined;
  if (!userId) {
    throw new HTTPException(401, {
      message: 'Could not validate credentials',
      res: new Response(null, {
        headers: { 'WWW-Authenticate': 'Bearer' },
      }),
    });
  }

  try {
    // Get user from database
    const user = await getCurrentUserFromToken(userId);
    c.set('user', user);

    // Set user context for RLS policies
    // This enables Row Level Security to identify the current user
    // Note: Using SET (not SET LOCAL) because we're not in an explicit transaction
    // The connection pool will maintain this for the duration of the request
    await sql`SET app.current_user_id = ${user.id}`;

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(401, { message: 'Authentication failed' });
  }
}
