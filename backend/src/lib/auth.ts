/**
 * Authentication utilities for JWT and password hashing
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7; // 7 days

/**
 * Verify a plain password against a hashed password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Hash a password using bcrypt
 */
export async function getPasswordHash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create a JWT access token
 */
export function createAccessToken(
  data: Record<string, unknown>,
  expiresInMinutes?: number
): string {
  const expiresIn = expiresInMinutes || ACCESS_TOKEN_EXPIRE_MINUTES;
  const exp = Math.floor(Date.now() / 1000) + expiresIn * 60;

  const payload = {
    ...data,
    exp,
  };

  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM });
}

/**
 * Decode and validate a JWT access token
 */
export function decodeAccessToken(token: string): Record<string, unknown> | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
    return decoded as Record<string, unknown>;
  } catch (_error) {
    return null;
  }
}
