'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import { useAdvocates } from '@/hooks/useAdvocates';

export default function Home() {
  const { data: advocates = [], isLoading, error } = useAdvocates();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAdvocates = useMemo(() => {
    if (!searchTerm) {
      return advocates;
    }

    const term = searchTerm.toLowerCase();
    return advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(term) ||
        advocate.lastName.toLowerCase().includes(term) ||
        advocate.city.toLowerCase().includes(term) ||
        advocate.degree.toLowerCase().includes(term) ||
        advocate.specialties.some((specialty) =>
          specialty.toLowerCase().includes(term)
        ) ||
        advocate.yearsOfExperience.toString().includes(term) ||
        advocate.phoneNumber.toString().includes(term)
      );
    });
  }, [advocates, searchTerm]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleReset = () => {
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <main className="m-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading advocates...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="m-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">
            Error loading advocates: {error.message}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="m-6">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>
      <div className="mb-6">
        <p className="mb-2">Search</p>
        <p className="mb-2">
          Searching for:{' '}
          <span className="font-semibold">{searchTerm || '(none)'}</span>
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
            {filteredAdvocates.map((advocate) => (
              <tr
                key={`${advocate.firstName}-${advocate.lastName}-${advocate.phoneNumber}`}
              >
                <td className="border border-gray-400 px-4 py-2">
                  {advocate.firstName}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {advocate.lastName}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {advocate.city}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {advocate.degree}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <div className="flex flex-col gap-1">
                    {advocate.specialties.map((specialty, index) => (
                      <span key={index} className="text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {advocate.yearsOfExperience}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {advocate.phoneNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
