/**
 * Domain models for Advocate entities.
 * These models represent the business logic layer and are separate from database schemas.
 */

/**
 * Advocate domain model representing the business entity
 */
export interface AdvocateModel {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date;
}

/**
 * Convert database schema to domain model
 */
export function toAdvocateModel(data: {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[] | unknown;
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date | string | null;
}): AdvocateModel {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    city: data.city,
    degree: data.degree,
    specialties: Array.isArray(data.specialties) ? data.specialties : [],
    yearsOfExperience: data.yearsOfExperience,
    phoneNumber: data.phoneNumber,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
  };
}
