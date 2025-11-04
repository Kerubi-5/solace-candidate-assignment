/**
 * Memoized table row component for displaying advocate information.
 * Reduces re-renders when only data changes.
 */

import { memo } from 'react';
import type { Advocate } from '@/types/advocate';

interface AdvocateRowProps {
  advocate: Advocate;
}

/**
 * AdvocateRow component displays a single advocate in a table row.
 * Memoized to prevent unnecessary re-renders.
 */
export const AdvocateRow = memo(function AdvocateRow({
  advocate,
}: AdvocateRowProps) {
  return (
    <tr>
      <td className="border border-gray-400 px-4 py-2">{advocate.firstName}</td>
      <td className="border border-gray-400 px-4 py-2">{advocate.lastName}</td>
      <td className="border border-gray-400 px-4 py-2">{advocate.city}</td>
      <td className="border border-gray-400 px-4 py-2">{advocate.degree}</td>
      <td className="border border-gray-400 px-4 py-2">
        <div className="flex flex-col gap-1">
          {advocate.specialties.map((specialty) => (
            <span key={specialty} className="text-sm">
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
  );
});
