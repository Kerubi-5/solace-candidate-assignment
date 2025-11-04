/**
 * Data Transfer Objects for Advocate API endpoints.
 * These DTOs define the shape of data sent to and received from the API.
 * Uses Zod schemas for runtime validation and TypeScript type inference.
 */

import { z } from 'zod';

/**
 * Zod schema for a single advocate response
 */
export const advocateResponseSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  city: z.string().min(1, 'City is required'),
  degree: z.string().min(1, 'Degree is required'),
  specialties: z.array(z.string()).default([]),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience must be non-negative'),
  phoneNumber: z.number().int().positive('Phone number must be positive'),
  createdAt: z.union([z.date(), z.string()]).optional(),
});

/**
 * Zod schema for getting a list of advocates response
 */
export const getAdvocatesResponseSchema = z.object({
  data: z.array(advocateResponseSchema),
});

/**
 * Zod schema for getting a single advocate response
 */
export const getAdvocateResponseSchema = z.object({
  data: advocateResponseSchema,
});

/**
 * Zod schema for creating/updating an advocate (for future use)
 */
export const createAdvocateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  city: z.string().min(1, 'City is required'),
  degree: z.string().min(1, 'Degree is required'),
  specialties: z.array(z.string()).default([]),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience must be non-negative'),
  phoneNumber: z.number().int().positive('Phone number must be positive'),
});

/**
 * Zod schema for filtering advocates from query parameters.
 * Handles query parameter parsing and validation.
 * All fields are optional - if none provided, returns all advocates.
 * - `search`: General search term that searches across firstName, lastName, city, and degree
 * - `city`: Filter by city (exact match)
 * - `degree`: Filter by degree (exact match)
 * - `specialty`: Filter by specialty (contains in specialties array)
 * - `minYearsOfExperience`: Filter by minimum years of experience
 */
export const filterAdvocatesSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  degree: z.string().optional(),
  specialty: z.string().optional(),
  minYearsOfExperience: z.coerce.number().int().min(0).optional(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type AdvocateResponseDto = z.infer<typeof advocateResponseSchema>;
export type GetAdvocatesResponseDto = z.infer<
  typeof getAdvocatesResponseSchema
>;
export type CreateAdvocateDto = z.infer<typeof createAdvocateSchema>;
export type FilterAdvocatesDto = z.infer<typeof filterAdvocatesSchema>;
