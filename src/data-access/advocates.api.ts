/**
 * Data access layer for Advocates API.
 * Handles all HTTP communication with the backend API.
 */

import type { GetAdvocatesResponseDto } from '@/server/advocates/dto/dto';
import type { Advocate } from '@/types/advocate';

/**
 * API client for advocates endpoints.
 * Provides typed methods for interacting with the advocates API.
 */
class AdvocatesApi {
  private readonly baseUrl = '/api/advocates';

  /**
   * Fetch all advocates from the API.
   * @returns Promise resolving to an array of advocates
   * @throws Error if the API request fails
   */
  async getAll(): Promise<Advocate[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch advocates: ${response.statusText}`);
      }

      const data: GetAdvocatesResponseDto = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching advocates:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch advocates');
    }
  }

  /**
   * Fetch a single advocate by ID (for future use).
   * @param id - The advocate ID
   * @returns Promise resolving to an advocate or null if not found
   * @throws Error if the API request fails
   */
  async getById(id: number): Promise<Advocate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch advocate: ${response.statusText}`);
      }

      const data: { data: Advocate } = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error fetching advocate ${id}:`, error);
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch advocate');
    }
  }
}

/**
 * Singleton instance of the AdvocatesApi client.
 */
export const advocatesApi = new AdvocatesApi();
