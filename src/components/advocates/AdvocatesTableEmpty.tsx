/**
 * Empty state component for advocates table.
 * Shows message when no advocates are found.
 */

interface AdvocatesTableEmptyProps {
  hasActiveSearch: boolean;
}

export function AdvocatesTableEmpty({
  hasActiveSearch,
}: AdvocatesTableEmptyProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        {hasActiveSearch
          ? 'No advocates found matching your search.'
          : 'No advocates available.'}
      </p>
    </div>
  );
}
