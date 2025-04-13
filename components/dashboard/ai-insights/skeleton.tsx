/**
 * AI Insights Skeleton Component
 * 
 * Skeleton loader for AI Insights while data is being fetched
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function AIInsightsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main insight card skeleton */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional insights skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
