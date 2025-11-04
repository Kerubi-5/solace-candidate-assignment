/**
 * React Query hook for fetching advocates.
 * Provides data, loading, and error states with automatic caching and refetching.
 */

import { useQuery } from '@tanstack/react-query';
import { advocatesApi } from '@/data-access/advocates.api';
import type { Advocate } from '@/types/advocate';

/**
 * Query keys for advocates queries.
 * Used for cache management and invalidation.
 */
export const advocatesQueryKeys = {
  all: ['advocates'] as const,
  lists: () => [...advocatesQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...advocatesQueryKeys.lists(), filters] as const,
  details: () => [...advocatesQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...advocatesQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch all advocates.
 * Uses React Query for automatic caching, loading states, and error handling.
 *
 * @returns Object containing advocates data, loading state, error state, and query methods
 */
export function useAdvocates() {
  return useQuery<Advocate[], Error>({
    queryKey: advocatesQueryKeys.lists(),
    queryFn: () => advocatesApi.getAll(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch a single advocate by ID.
 * Uses React Query for automatic caching, loading states, and error handling.
 *
 * @param id - The advocate ID
 * @returns Object containing advocate data, loading state, error state, and query methods
 */
export function useAdvocate(id: number) {
  return useQuery<Advocate | null, Error>({
    queryKey: advocatesQueryKeys.detail(id),
    queryFn: () => advocatesApi.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
