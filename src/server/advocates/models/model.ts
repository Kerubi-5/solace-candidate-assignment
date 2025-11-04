/**
 * Database schema and domain models for Advocate entities.
 * Schema defines the database structure, model represents the business logic layer.
 */

import { sql } from 'drizzle-orm';
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
} from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';

/**
 * Advocates database table schema.
 */
export const advocates = pgTable('advocates', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  city: text('city').notNull(),
  degree: text('degree').notNull(),
  specialties: jsonb('specialties').default([]).notNull(),
  yearsOfExperience: integer('years_of_experience').notNull(),
  phoneNumber: bigint('phone_number', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Advocate domain model inferred from database schema.
 */
export type AdvocateModel = InferSelectModel<typeof advocates>;

/**
 * Convert database schema result to domain model.
 * Handles type conversion and ensures data consistency.
 */
export function toAdvocateModel(
  data: AdvocateModel & {
    createdAt?: Date | string | null;
    specialties?: string[] | unknown;
  }
): AdvocateModel {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    city: data.city,
    degree: data.degree,
    specialties: Array.isArray(data.specialties)
      ? data.specialties
      : (data.specialties as string[]) || [],
    yearsOfExperience: data.yearsOfExperience,
    phoneNumber: data.phoneNumber,
    createdAt: data.createdAt
      ? data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt)
      : (data.createdAt ?? null),
  };
}
