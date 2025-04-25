/**
 * Journey Map Skeleton Component
 *
 * Loading state placeholder for the Journey Map component
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function JourneyMapSkeleton() {
  return (
    <div className="space-y-6">
      {/* Phase buttons skeleton */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-8 w-24 rounded-full" />
            {i < 4 && <Skeleton className="h-4 w-4 mx-1" />}
          </div>
        ))}
      </div>

      {/* Phase details skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>

          <Skeleton className="h-2 w-full mb-4" />

          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
