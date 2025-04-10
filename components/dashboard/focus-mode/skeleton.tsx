/**
 * Focus Mode Skeleton Component
 * 
 * Loading state placeholder for the Focus Mode component
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FocusModeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome and progress overview skeleton */}
      <div className="rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-3 w-16 mx-auto mb-1" />
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-3 w-8 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="w-full h-10 rounded-lg bg-muted overflow-hidden">
        <div className="grid grid-cols-3 h-full">
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
        </div>
      </div>
      
      {/* Priority focus area skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          
          <div className="flex space-x-2 mt-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </CardContent>
      </Card>
      
      {/* Other focus areas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-1 w-full" />
              </div>
              
              <Skeleton className="h-8 w-24 rounded-md mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
