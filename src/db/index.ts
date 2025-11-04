import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database connection configuration.
 * Uses postgres-js for local development with Docker PostgreSQL.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '⚠️  DATABASE_URL is not set. Database operations will fail at runtime.'
  );
}

/**
 * Postgres client configuration.
 * Connection pooling is configured based on environment.
 */
const queryClient = postgres(connectionString || 'postgres://localhost', {
  max: connectionString ? 10 : 1,
  idle_timeout: connectionString ? 20 : 1,
  connect_timeout: 10,
});

/**
 * Drizzle database instance with schema for full type inference.
 * Always defined - never null or undefined.
 * If DATABASE_URL is not set, database operations will throw errors at runtime.
 */
export const db = drizzle(queryClient, { schema });

/**
 * Database type for type inference throughout the application.
 */
export type Database = typeof db;

export default db;
