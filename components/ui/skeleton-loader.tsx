'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function SkeletonCard({
  isLoading = true,
  children = null,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)} {...props}>
      {isLoading ? (
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface SkeletonDashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  cardCount?: number;
}

export function SkeletonDashboard({
  isLoading = true,
  children,
  cardCount = 4,
  className,
  ...props
}: SkeletonDashboardProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {isLoading ? (
        <>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: cardCount }).map((_, index) => (
              <SkeletonCard key={index} isLoading={true} />
            ))}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  itemCount?: number;
}

export function SkeletonList({
  isLoading = true,
  children,
  itemCount = 5,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {isLoading ? (
        <>
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </>
      ) : (
        children
      )}
    </div>
  );
}

interface SkeletonSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  itemCount?: number;
}

export function SkeletonSidebar({
  isLoading = true,
  children,
  itemCount = 8,
  className,
  ...props
}: SkeletonSidebarProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-full rounded-md mb-4" />
          {Array.from({ length: itemCount }).map((_, index) => (
            <React.Fragment key={index}>
              {index % 3 === 0 && index > 0 && <Skeleton className="h-5 w-1/2 mt-4 mb-2" />}
              <div className="flex items-center space-x-2 p-1">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </React.Fragment>
          ))}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function SkeletonProgressiveList({
  children,
  className,
  itemCount = 10,
  initialLoadCount = 3,
  ...props
}: SkeletonListProps & { initialLoadCount?: number }) {
  const [loadedCount, setLoadedCount] = React.useState(initialLoadCount);
  const childrenArray = React.Children.toArray(children);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setLoadedCount(prev => {
        const next = prev + 1;
        if (next >= childrenArray.length) {
          clearInterval(timer);
        }
        return next;
      });
    }, 150); // Load a new item every 150ms

    return () => clearInterval(timer);
  }, [childrenArray.length]);

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {childrenArray.map((child, index) => (
        <div key={index} className={index >= loadedCount ? 'hidden' : ''}>
          {child}
        </div>
      ))}
      {loadedCount < childrenArray.length && (
        <div className="animate-pulse">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
    </div>
  );
}
