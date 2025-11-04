/**
 * Custom hook for managing advocate search and data fetching.
 * Encapsulates search state, debouncing, filter generation, and data fetching logic.
 */

import { useState, useMemo, useCallback, useEffect, ChangeEvent } from 'react';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { advocatesApi } from '@/data-access/advocates.api';
import { advocatesQueryKeys } from './useAdvocates';
import type { Advocate } from '@/types/advocate';
import type { FilterAdvocatesDto } from '@/server/advocates/dto/dto';

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

interface UseAdvocateSearchReturn {
  searchTerm: string;
  searchQuery: string;
  hasActiveSearch: boolean;
  advocates: Advocate[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: Error | null | undefined;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
  handlePageChange: (page: number) => void;
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm] = useDebounce(searchTerm, debounceDelay);

  const limit = 10;

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Build filter object from search term with pagination
  // Uses general 'search' parameter that searches across firstName, lastName, city, degree, and specialties
  // Always paginated with limit of 10 (max allowed)
  const filters: FilterAdvocatesDto = useMemo(() => {
    const offset = (currentPage - 1) * limit;
    const baseFilters: FilterAdvocatesDto = {
      limit,
      offset,
    };

    if (debouncedSearchTerm.trim()) {
      baseFilters.search = debouncedSearchTerm.trim();
    }

    return baseFilters;
  }, [debouncedSearchTerm, currentPage]);

  // Fetch advocates data based on filters
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: advocatesQueryKeys.list(filters),
    queryFn: () => advocatesApi.getAll(filters),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const advocates = response?.data ?? [];
  const paginationData = response?.pagination;

  // Calculate pagination info
  const pagination: PaginationInfo = useMemo(() => {
    if (!paginationData) {
      return {
        limit,
        offset: 0,
        total: 0,
        hasMore: false,
        currentPage: 1,
        totalPages: 0,
      };
    }

    const totalPages = Math.ceil(paginationData.total / limit);

    return {
      limit: paginationData.limit,
      offset: paginationData.offset,
      total: paginationData.total,
      hasMore: paginationData.hasMore,
      currentPage,
      totalPages,
    };
  }, [paginationData, currentPage]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Memoize hasActiveSearch to avoid recalculation on every render
  const hasActiveSearch = useMemo(
    () => debouncedSearchTerm.trim().length > 0,
    [debouncedSearchTerm]
  );

  return {
    searchTerm,
    searchQuery: debouncedSearchTerm,
    hasActiveSearch,
    advocates,
    pagination,
    isLoading,
    error,
    handleSearchChange,
    handleReset,
    handlePageChange,
  };
}
