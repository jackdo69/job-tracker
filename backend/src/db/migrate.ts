/**
 * Run database migrations
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { logger } from '../lib/logger.js';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error('DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL environment variable is not set');
}

const runMigrations = async () => {
  logger.info('='.repeat(60));
  logger.info('🔄 Running database migrations...');
  logger.info('='.repeat(60));

  const start = Date.now();
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  logger.info({ folder: './drizzle' }, 'Applying migrations from folder');

  await migrate(db, { migrationsFolder: './drizzle' });

  await sql.end();

  const duration = Date.now() - start;
  logger.info('='.repeat(60));
  logger.info({ duration: `${duration}ms` }, '✅ Migrations completed successfully!');
  logger.info('='.repeat(60));
};

runMigrations().catch((err: unknown) => {
  logger.error({ err }, '❌ Migration failed!');
  logger.error('Please check your database connection and migration files');
  process.exit(1);
});
