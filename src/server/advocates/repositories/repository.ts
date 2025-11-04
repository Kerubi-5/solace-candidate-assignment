/**
 * Repository pattern for Advocate data access.
 * Abstracts database operations and provides a clean interface for the service layer.
 */

import db from '@/db';
import { advocates } from '@/db/schema';
import { advocateData } from '@/db/seed/advocates';
import type { AdvocateModel } from '../models/model';
import { toAdvocateModel } from '../models/model';
import type { FilterAdvocatesDto } from '../dto/dto';

/**
 * AdvocateRepository handles all database operations for advocates.
 */
export class AdvocateRepository {
  /**
   * Get all advocates from the database or seed data.
   * Currently uses seed data. Uncomment the database query to use the database.
   */
  async findAll(): Promise<AdvocateModel[]> {
    try {
      // Uncomment this line to use a database
      // const results = await db.select().from(advocates);
      // return results.map(toAdvocateModel);

      // Using seed data for now
      return advocateData.map(toAdvocateModel);
    } catch (error) {
      console.error('Error fetching advocates from repository:', error);
      throw new Error('Failed to fetch advocates');
    }
  }

  /**
   * Find advocates by ID (for future use)
   */
  async findById(id: number): Promise<AdvocateModel | null> {
    try {
      // Uncomment this line to use a database
      // const result = await db.select().from(advocates).where(eq(advocates.id, id)).limit(1);
      // return result[0] ? toAdvocateModel(result[0]) : null;

      // Using seed data for now
      const advocate = advocateData.find((a) => a.phoneNumber === id);
      return advocate ? toAdvocateModel(advocate) : null;
    } catch (error) {
      console.error(`Error fetching advocate ${id} from repository:`, error);
      throw new Error(`Failed to fetch advocate ${id}`);
    }
  }

  /**
   * Filter advocates by criteria (for future use)
   */
  async findByFilter(filter: FilterAdvocatesDto): Promise<AdvocateModel[]> {
    try {
      const allAdvocates = await this.findAll();

      return allAdvocates.filter((advocate) => {
        if (
          filter.city &&
          advocate.city.toLowerCase() !== filter.city.toLowerCase()
        ) {
          return false;
        }
        if (filter.degree && advocate.degree !== filter.degree) {
          return false;
        }
        if (
          filter.specialty &&
          !advocate.specialties.includes(filter.specialty)
        ) {
          return false;
        }
        if (
          filter.minYearsOfExperience &&
          advocate.yearsOfExperience < filter.minYearsOfExperience
        ) {
          return false;
        }
        return true;
      });
    } catch (error) {
      console.error('Error filtering advocates from repository:', error);
      throw new Error('Failed to filter advocates');
    }
  }
}

/**
 * Singleton instance of AdvocateRepository
 */
export const advocateRepository = new AdvocateRepository();
