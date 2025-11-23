/**
 * Run database migrations
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const runMigrations = async () => {
  console.log('Running migrations...');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: './drizzle' });

  await sql.end();

  console.log('Migrations completed!');
};

runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
