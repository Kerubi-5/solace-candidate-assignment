'use client';

import { useAdvocateSearch } from '@/hooks/useAdvocateSearch';
import { SearchInput } from '@/components/search/SearchInput';
import { AdvocatesTable } from '@/components/advocates/AdvocatesTable';
import { AdvocatesTableSkeleton } from '@/components/advocates/AdvocatesTableSkeleton';
import { AdvocatesTableError } from '@/components/advocates/AdvocatesTableError';
import { AdvocatesTableEmpty } from '@/components/advocates/AdvocatesTableEmpty';

export default function Home() {
  const {
    searchTerm,
    searchQuery,
    hasActiveSearch,
    advocates,
    pagination,
    isLoading,
    error,
    handleSearchChange,
    handleReset,
    handlePageChange,
  } = useAdvocateSearch();

  return (
    <main className="m-6">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>
      <div className="mb-6">
        <p className="mb-2">Search</p>
        <p className="mb-2">
          Searching for:{' '}
          <span className="font-semibold">{searchQuery || '(none)'}</span>
        </p>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onReset={handleReset}
        />
      </div>
      {error ? (
        <AdvocatesTableError error={error} />
      ) : isLoading ? (
        <AdvocatesTableSkeleton />
      ) : advocates.length === 0 ? (
        <AdvocatesTableEmpty hasActiveSearch={hasActiveSearch} />
      ) : (
        <AdvocatesTable
          data={advocates}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
