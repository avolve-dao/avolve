/**
 * Token Balance Skeleton Component
 * 
 * Loading state placeholder for the Token Balance component
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { Skeleton } from "@/components/ui/skeleton";

export function TokenBalanceSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((i) => (
          <Skeleton 
            key={i} 
            className="h-9 w-24 rounded-full"
          />
        ))}
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
