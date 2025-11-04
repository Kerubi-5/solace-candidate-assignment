'use client';

import { useAdvocateSearch } from '@/hooks/useAdvocateSearch';
import { AdvocateRow } from '@/components/AdvocateRow';
import { PaginationControls } from '@/components/PaginationControls';

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
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-black px-3 py-2 rounded"
            placeholder="Search advocates..."
          />
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded border border-gray-400"
          >
            Reset Search
          </button>
        </div>
      </div>
      {error ? (
        <div className="text-center py-8">
          <p className="text-lg text-red-600">
            Error loading advocates: {error.message}
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading advocates...</p>
        </div>
      ) : advocates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {hasActiveSearch
              ? 'No advocates found matching your search.'
              : 'No advocates available.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  First Name
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  Last Name
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  City
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  Degree
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  Specialties
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  Years of Experience
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left">
                  Phone Number
                </th>
              </tr>
            </thead>
            <tbody>
              {advocates.map((advocate) => (
                <AdvocateRow key={advocate.id} advocate={advocate} />
              ))}
            </tbody>
          </table>
          {pagination.totalPages > 1 && (
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </main>
  );
}
