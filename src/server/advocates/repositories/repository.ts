/**
 * Repository pattern for Advocate data access.
 * Abstracts database operations and provides a clean interface for the service layer.
 */

import { db } from '@/db';
import { advocates } from '../models/model';
import { eq, and, or, ilike, gte, sql } from 'drizzle-orm';
import type { AdvocateModel } from '../models/model';
import { toAdvocateModel } from '../models/model';
import type { FilterAdvocatesDto } from '../dto/dto';

/**
 * AdvocateRepository handles all database operations for advocates.
 */
export class AdvocateRepository {
  /**
   * Get all advocates from the database.
   * Optionally accepts filters for server-side filtering.
   *
   * @param filters - Optional filter criteria for filtering advocates
   * @returns Array of advocate models
   */
  async findAll(filters?: FilterAdvocatesDto): Promise<AdvocateModel[]> {
    // Check if any filter fields are actually provided
    const hasFilters =
      filters &&
      (filters.search !== undefined ||
        filters.city !== undefined ||
        filters.degree !== undefined ||
        filters.specialty !== undefined ||
        filters.minYearsOfExperience !== undefined);

    // If filters are provided, use filtering logic
    if (hasFilters) {
      return this.findByFilter(filters);
    }

    // Otherwise, return all advocates
    const results = await db.select().from(advocates);
    return results.map(toAdvocateModel);
  }

  /**
   * Find advocate by ID.
   */
  async findById(id: number): Promise<AdvocateModel | null> {
    const result = await db
      .select()
      .from(advocates)
      .where(eq(advocates.id, id))
      .limit(1);
    return result?.length ? toAdvocateModel(result[0]) : null;
  }

  /**
   * Filter advocates by criteria using database queries.
   * Performs filtering at the database level for better performance.
   * Internal method used by findAll when filters are provided.
   */
  private async findByFilter(
    filter: FilterAdvocatesDto
  ): Promise<AdvocateModel[]> {
    // Build WHERE conditions dynamically based on filter
    const conditions = [];

    // General search: searches across firstName, lastName, city, degree, and specialties
    // All searches are case-insensitive
    if (filter.search) {
      const searchPattern = `%${filter.search}%`;

      // Search in text fields (case-insensitive with ILIKE)
      const textSearch = or(
        ilike(advocates.firstName, searchPattern),
        ilike(advocates.lastName, searchPattern),
        ilike(advocates.city, searchPattern),
        ilike(advocates.degree, searchPattern)
      );

      // Search in specialties: convert JSONB to text and search (case-insensitive)
      const specialtiesSearch = sql`LOWER(${advocates.specialties}::text) LIKE LOWER(${searchPattern})`;

      const searchConditions = or(textSearch, specialtiesSearch);
      if (searchConditions) {
        conditions.push(searchConditions);
      }
    }

    // Specific filters (only applied if general search is not used)
    if (filter.city && !filter.search) {
      conditions.push(ilike(advocates.city, `%${filter.city}%`));
    }

    if (filter.degree && !filter.search) {
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

    // Build query with conditions
    const queryBuilder = db.select().from(advocates);

    const results =
      conditions.length > 0
        ? await queryBuilder.where(and(...conditions))
        : await queryBuilder;

    return results.map(toAdvocateModel);
  }
}

/**
 * Singleton instance of AdvocateRepository
 */
export const advocateRepository = new AdvocateRepository();
