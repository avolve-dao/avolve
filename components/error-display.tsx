'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
