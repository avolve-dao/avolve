/**
 * Feature Preview Skeleton Component
 *
 * Loading state placeholder for the Feature Preview component
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function FeaturePreviewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tabs skeleton */}
      <div className="w-full h-10 rounded-lg bg-muted overflow-hidden">
        <div className="flex">
          <Skeleton className="h-full w-1/2" />
          <Skeleton className="h-full w-1/2" />
        </div>
      </div>

      {/* Feature list skeleton */}
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Feature details skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <Skeleton className="h-4 w-full mb-4" />

          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-1 w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <div className="space-y-1">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="w-4 h-4 mr-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/50 flex-col items-start pt-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="space-y-1 w-full">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start">
                <Skeleton className="w-4 h-4 mr-1 mt-0.5" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
