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
  full_name?: string;
}

/**
 * Login/Register response
 * Uses snake_case to match API response format
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Google OAuth callback query parameters
 */
export interface GoogleCallbackQuery {
  code: string;
  state?: string;
}
