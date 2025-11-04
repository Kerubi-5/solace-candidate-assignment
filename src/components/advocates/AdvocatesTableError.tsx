/**
 * Error display component for advocates table.
 * Shows error message with retry option.
 */

import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface AdvocatesTableErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function AdvocatesTableError({
  error,
  onRetry,
}: AdvocatesTableErrorProps) {
  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
        <div>
          <p className="text-lg font-semibold text-red-600">
            Error loading advocates
          </p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
