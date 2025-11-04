/**
 * Memoized pagination controls component.
 * Optimized to prevent unnecessary re-renders and expensive calculations.
 */

import { memo, useMemo, useCallback } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
}

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

/**
 * PaginationControls component for navigating between pages.
 * Memoized to prevent unnecessary re-renders.
 */
export const PaginationControls = memo(function PaginationControls({
  pagination,
  onPageChange,
}: PaginationControlsProps) {
  const { currentPage, totalPages } = pagination;

  // Calculate visible pages
  const visiblePages = useMemo(() => {
    if (totalPages <= 1) return [];

    const pages: Array<number | 'ellipsis'> = [1];

    // Show ellipsis before if current page is far from start
    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Add pages around current (current-1, current, current+1)
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show ellipsis after if current page is far from end
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Add last page if not already included
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePrevious = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pagination.currentPage > 1) {
        onPageChange(pagination.currentPage - 1);
      }
    },
    [pagination.currentPage, onPageChange]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pagination.currentPage < pagination.totalPages) {
        onPageChange(pagination.currentPage + 1);
      }
    },
    [pagination.currentPage, pagination.totalPages, onPageChange]
  );

  const handlePageClick = useCallback(
    (page: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onPageChange(page);
    },
    [onPageChange]
  );

  const isPreviousDisabled = pagination.currentPage === 1;
  const isNextDisabled = pagination.currentPage === pagination.totalPages;

  return (
    <div className="mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={handlePrevious}
              className={
                isPreviousDisabled
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={handlePageClick(page)}
                  isActive={pagination.currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={handleNext}
              className={
                isNextDisabled
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
});
