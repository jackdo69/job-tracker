/**
 * Shared authentication types for Job Tracker
 * Used by both frontend and backend
 */

import { User } from './user.js';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Login/Register response
 * Uses camelCase for TypeScript/JavaScript conventions
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

/**
 * Google OAuth callback query parameters
 */
export interface GoogleCallbackQuery {
  code: string;
  state?: string;
}
