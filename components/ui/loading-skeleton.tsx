import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

/**
 * LoadingSkeleton component for consistent loading states across the Avolve platform
 *
 * @param className - Additional classes to apply
 * @param size - Size of the loading spinner (sm, md, lg)
 * @param message - Optional message to display during loading
 * @param fullPage - Whether to display as a full page loader
 */
export function LoadingSkeleton({
  className,
  size = 'md',
  message,
  fullPage = false,
}: LoadingSkeletonProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={cn(containerClasses, className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && <p className="mt-4 text-sm text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );
}

export default LoadingSkeleton;
