/**
 * Application configuration
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // API Settings
  apiPrefix: '/api',
  projectName: 'Job Tracker API',
  version: '1.0.0',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:8080'],

  // Database
  databaseUrl:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jobtracker',

  // Authentication / Security
  secretKey: process.env.SECRET_KEY || 'your-secret-key-change-this-in-production',
  algorithm: 'HS256',
  accessTokenExpireMinutes: 60 * 24 * 7, // 7 days

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/auth/google/callback',

  // Server
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '8080', 10),
};
