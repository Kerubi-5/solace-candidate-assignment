/**
 * Repository pattern for Advocate data access.
 * Abstracts database operations and provides a clean interface for the service layer.
 */

import { db } from '@/db';
import { advocates } from '../models/model';
import { eq, and, ilike, gte, sql } from 'drizzle-orm';
import type { AdvocateModel } from '../models/model';
import { toAdvocateModel } from '../models/model';
import type { FilterAdvocatesDto } from '../dto/dto';

/**
 * AdvocateRepository handles all database operations for advocates.
 */
export class AdvocateRepository {
  /**
   * Get all advocates from the database.
   */
  async findAll(): Promise<AdvocateModel[]> {
    try {
      const results = await db.select().from(advocates);
      return results.map(toAdvocateModel);
    } catch (error) {
      console.error('Error fetching advocates from repository:', error);
      throw new Error('Failed to fetch advocates');
    }
  }

  /**
   * Find advocate by ID.
   */
  async findById(id: number): Promise<AdvocateModel | null> {
    try {
      const result = await db
        .select()
        .from(advocates)
        .where(eq(advocates.id, id))
        .limit(1);
      return result?.length ? toAdvocateModel(result[0]) : null;
    } catch (error) {
      console.error(`Error fetching advocate ${id} from repository:`, error);
      throw new Error(`Failed to fetch advocate ${id}`);
    }
  }

  /**
   * Filter advocates by criteria using database queries.
   * Performs filtering at the database level for better performance.
   */
  async findByFilter(filter: FilterAdvocatesDto): Promise<AdvocateModel[]> {
    try {
      // Build WHERE conditions dynamically based on filter
      const conditions = [];

      if (filter.city) {
        conditions.push(ilike(advocates.city, `%${filter.city}%`));
      }

      if (filter.degree) {
        conditions.push(eq(advocates.degree, filter.degree));
      }

      if (filter.specialty) {
        // Use JSONB @> operator to check if specialties array contains the specialty
        conditions.push(
          sql`${advocates.specialties} @> ${JSON.stringify([filter.specialty])}`
        );
      }

      if (filter.minYearsOfExperience !== undefined) {
        conditions.push(
          gte(advocates.yearsOfExperience, filter.minYearsOfExperience)
        );
      }

      // Build query with conditions - use method chaining
      const queryBuilder = db.select().from(advocates);

      const results =
        conditions.length > 0
          ? await queryBuilder.where(and(...conditions))
          : await queryBuilder;

      return results.map(toAdvocateModel);
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
