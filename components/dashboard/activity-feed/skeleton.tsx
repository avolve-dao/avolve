/**
 * Activity Feed Skeleton Component
 * 
 * Skeleton loader for Activity Feed while data is being fetched
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="notification">Notifications</TabsTrigger>
          <TabsTrigger value="event_completion">Events</TabsTrigger>
          <TabsTrigger value="token_transaction">Tokens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4 space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-3 rounded-lg border">
              <Skeleton className="w-10 h-10 rounded-full" />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
