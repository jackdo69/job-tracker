/**
 * Database connection and client
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { logger } from '../lib/logger.js';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error('DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
logger.info('Initializing database connection...');
export const sql = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notices
  onparameter: () => {}, // Suppress parameter changes
});

// Create Drizzle instance
export const db = drizzle(sql, { schema });
logger.info({
  maxConnections: 10,
  idleTimeout: '20s',
  connectTimeout: '10s'
}, 'Database client initialized');
