/**
 * Authentication service for user registration and login
 */
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, type User } from '../db/schema.js';
import type { UserCreate, LoginRequest, LoginResponse, UserResponse } from '../schemas/user.js';
import { verifyPassword, getPasswordHash, createAccessToken } from '../lib/auth.js';
import { HTTPException } from 'hono/http-exception';

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
export async function registerUser(userData: UserCreate): Promise<UserResponse> {
  // Check if user already exists
  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new HTTPException(400, { message: 'Email already registered' });
  }

  // Create new user
  const hashedPassword = await getPasswordHash(userData.password);
  const [newUser] = await db
    .insert(users)
    .values({
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
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
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
    access_token: accessToken,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
