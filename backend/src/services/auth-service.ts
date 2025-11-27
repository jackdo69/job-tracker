/**
 * Authentication service for user registration and login
 */
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, type User } from '../db/schema.js';
import type { UserResponse } from '../schemas/user.js';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@jackdo69/job-tracker-shared-types';
import { verifyPassword, getPasswordHash, createAccessToken } from '../lib/auth.js';
import { HTTPException } from 'hono/http-exception';
import crypto from 'crypto';

/**
 * Get a user by email address
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterRequest): Promise<any> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new HTTPException(400, { message: 'Email already registered' });
    }

    // Create new user with explicit UUID
    const hashedPassword = await getPasswordHash(userData.password);
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: userData.email,
        hashedPassword,
        fullName: userData.fullName,
        isActive: true,
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error registering user:', error);
    throw new HTTPException(500, { message: 'Failed to register user' });
  }
}

/**
 * Authenticate a user and return access token
 */
export async function authenticateUser(loginData: LoginRequest): Promise<LoginResponse> {
  // Get user by email
  const user = await getUserByEmail(loginData.email);
  if (!user) {
    throw new HTTPException(401, {
      message: 'Incorrect email or password',
      res: new Response(null, {
        headers: { 'WWW-Authenticate': 'Bearer' },
      }),
    });
  }

  // Verify password
  const isValidPassword = await verifyPassword(loginData.password, user.hashedPassword);
  if (!isValidPassword) {
    throw new HTTPException(401, {
      message: 'Incorrect email or password',
      res: new Response(null, {
        headers: { 'WWW-Authenticate': 'Bearer' },
      }),
    });
  }

  // Check if user is active
  if (!user.isActive) {
    throw new HTTPException(400, { message: 'Inactive user account' });
  }

  // Create access token
  const accessToken = createAccessToken({
    sub: user.id,
    email: user.email,
  });

  return {
    accessToken: accessToken,
    tokenType: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  };
}

/**
 * Get current user from token payload
 */
export async function getCurrentUserFromToken(userId: string): Promise<User> {
  const user = await getUserById(userId);
  if (!user) {
    throw new HTTPException(401, {
      message: 'User not found',
      res: new Response(null, {
        headers: { 'WWW-Authenticate': 'Bearer' },
      }),
    });
  }

  if (!user.isActive) {
    throw new HTTPException(400, { message: 'Inactive user account' });
  }

  return user;
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(clientId: string, redirectUri: string): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Exchange Google OAuth code for tokens
 */
async function getGoogleTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; id_token: string }> {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(values),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Google token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        redirectUri
      });

      // Parse the error to provide a better message
      let errorMessage = 'Failed to exchange authorization code';
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error_description) {
          errorMessage = errorJson.error_description;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // If parsing fails, use the raw error body
        errorMessage = errorBody || errorMessage;
      }

      throw new HTTPException(400, { message: errorMessage });
    }

    return response.json() as Promise<{ access_token: string; id_token: string }>;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error exchanging Google authorization code:', error);
    throw new HTTPException(500, { message: 'Failed to complete Google authentication' });
  }
}

/**
 * Get Google user info from access token
 */
async function getGoogleUser(access_token: string, id_token: string): Promise<{
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Failed to fetch Google user info:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new HTTPException(400, { message: 'Failed to fetch user info from Google' });
    }

    return response.json() as Promise<{
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
    }>;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error fetching Google user info:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve user information' });
  }
}

/**
 * Handle Google OAuth callback and login/register user
 */
export async function handleGoogleCallback(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<LoginResponse> {
  try {
    // Exchange code for tokens
    const { access_token, id_token } = await getGoogleTokens(code, clientId, clientSecret, redirectUri);

    // Get user info from Google
    const googleUser = await getGoogleUser(access_token, id_token);

    if (!googleUser.verified_email) {
      throw new HTTPException(403, { message: 'Google email not verified' });
    }

    // Check if user exists
    let user = await getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user (OAuth users have a special marker instead of password)
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            email: googleUser.email,
            hashedPassword: 'OAUTH_USER', // Special marker for OAuth-only users
            fullName: googleUser.name,
            isActive: true,
          })
          .returning();

        user = newUser;
      } catch (dbError) {
        console.error('Failed to create OAuth user:', dbError);
        throw new HTTPException(500, { message: 'Failed to create user account' });
      }
    }

    // Create access token
    const accessToken = createAccessToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken: accessToken,
      tokenType: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Google OAuth callback error:', error);
    throw new HTTPException(500, { message: 'Authentication failed' });
  }
}
