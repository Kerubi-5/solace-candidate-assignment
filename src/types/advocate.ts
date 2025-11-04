/**
 * Advocate type definition matching the database schema structure.
 * Used throughout the application for type safety.
 */
export interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date | string;
}
