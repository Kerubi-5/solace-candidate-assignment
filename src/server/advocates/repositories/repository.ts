/**
 * Repository pattern for Advocate data access.
 * Abstracts database operations and provides a clean interface for the service layer.
 */

import { db } from '@/db';
import { advocates } from '../models/model';
import { eq, and, or, ilike, gte, sql, count } from 'drizzle-orm';
import type { AdvocateModel } from '../models/model';
import { toAdvocateModel } from '../models/model';
import type { FilterAdvocatesDto } from '../dto/dto';

/**
 * Result type for paginated queries
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

/**
 * AdvocateRepository handles all database operations for advocates.
 */
export class AdvocateRepository {
  /**
   * Helper method to execute paginated query with count.
   *
   * @param whereClause - Optional WHERE clause for both data and count queries
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Paginated result with data and total count
   */
  private async executePaginatedQuery(
    whereClause: ReturnType<typeof and> | undefined, // WHERE clause for both data and count queries if provided
    limit: number,
    offset: number
  ): Promise<PaginatedResult<AdvocateModel>> {
    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(advocates)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(advocates).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
      data: results.map(toAdvocateModel),
      total,
    };
  }

  /**
   * Get advocates from the database with pagination.
   * Optionally accepts filters for server-side filtering.
   *
   * @param filters - Optional filter criteria and pagination parameters
   * @returns Paginated result with data and total count
   */
  async findAll(
    filters?: FilterAdvocatesDto
  ): Promise<PaginatedResult<AdvocateModel>> {
    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;

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
      return this.findByFilter(filters, limit, offset);
    }

    // Otherwise, return all advocates with pagination
    return this.executePaginatedQuery(undefined, limit, offset);
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
    filter: FilterAdvocatesDto,
    limit: number,
    offset: number
  ): Promise<PaginatedResult<AdvocateModel>> {
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

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute paginated query using helper method
    return this.executePaginatedQuery(whereClause, limit, offset);
  }
}

/**
 * Singleton instance of AdvocateRepository
 */
export const advocateRepository = new AdvocateRepository();
