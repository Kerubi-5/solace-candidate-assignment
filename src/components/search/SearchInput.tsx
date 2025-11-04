/**
 * Search input component for advocates.
 * Extracted from page.tsx for reusability and cleaner code.
 */

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

export function SearchInput({
  searchTerm,
  onSearchChange,
  onReset,
}: SearchInputProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search advocates..."
        className="max-w-sm"
      />
      <Button variant="outline" onClick={onReset}>
        Reset Search
      </Button>
    </div>
  );
}
