/**
 * Custom hook for managing advocate search and data fetching.
 * Encapsulates search state, debouncing, filter generation, and data fetching logic.
 */

import { useState, useMemo, useCallback, ChangeEvent } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { advocatesApi } from '@/data-access/advocates.api';
import { advocatesQueryKeys } from './useAdvocates';
import type { Advocate } from '@/types/advocate';
import type { FilterAdvocatesDto } from '@/server/advocates/dto/dto';

interface UseAdvocateSearchReturn {
  searchTerm: string;
  searchQuery: string;
  hasActiveSearch: boolean;
  advocates: Advocate[];
  isLoading: boolean;
  error: Error | null | undefined;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
}

/**
 * Hook that manages advocate search state and data fetching.
 * Combines search UI logic (debouncing, filter generation) with data fetching.
 *
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 300ms)
 * @returns Search state, debounced value, advocates data, loading/error states, and handlers
 */
export function useAdvocateSearch(
  debounceDelay: number = 300
): UseAdvocateSearchReturn {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, debounceDelay);

  // Build filter object from search term
  // Uses general 'search' parameter that searches across firstName, lastName, city, and degree
  const filters: FilterAdvocatesDto | undefined = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return undefined;
    }

    return {
      search: debouncedSearchTerm.trim(),
    };
  }, [debouncedSearchTerm]);

  // Fetch advocates data based on filters
  const {
    data: advocates = [],
    isLoading,
    error,
  } = useQuery<Advocate[], Error>({
    queryKey: advocatesQueryKeys.list(filters),
    queryFn: () => advocatesApi.getAll(filters),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm('');
  }, []);

  const hasActiveSearch = debouncedSearchTerm.trim().length > 0;

  return {
    searchTerm,
    searchQuery: debouncedSearchTerm,
    hasActiveSearch,
    advocates,
    isLoading,
    error,
    handleSearchChange,
    handleReset,
  };
}
