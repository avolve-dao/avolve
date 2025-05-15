"use client"

import type React from "react"

import { useState } from "react"
import { useApiWithRetry } from "@/hooks/use-api-with-retry"
import { NetworkError } from "@/components/error-states/network-error"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedButton, AnimatedCard } from "@/components/animations/feedback-animations"
import { ErrorBoundary } from "@/components/error-boundary"

interface DataDisplayProps<T> {
  title: string
  fetchFn: () => Promise<T>
  renderItem: (item: T) => React.ReactNode
  cacheKey?: string
  emptyMessage?: string
}

export function OptimizedDataDisplay<T>({
  title,
  fetchFn,
  renderItem,
  cacheKey,
  emptyMessage = "No data available",
}: DataDisplayProps<T>) {
  const [isSuccess, setIsSuccess] = useState(false)

  const { data, isLoading, isError, error, retryCount, isRetrying, retry } = useApiWithRetry(fetchFn, {
    cacheKey,
    maxRetries: 3,
    onSuccess: () => {
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 1000)
    },
  })

  // Show network error state
  if (isError && !isRetrying) {
    return (
      <NetworkError
        retryCount={retryCount}
        isRetrying={isRetrying}
        onRetry={retry}
        description={error?.message || "Failed to load data. Please try again."}
      />
    )
  }

  return (
    <ErrorBoundary>
      <AnimatedCard animationType="fade" className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <AnimatedButton
            onClick={() => retry()}
            isLoading={isLoading}
            isSuccess={isSuccess}
            className="h-8 w-8 p-0 rounded-full"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </AnimatedButton>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : data ? (
            renderItem(data)
          ) : (
            <div className="text-center py-4 text-muted-foreground">{emptyMessage}</div>
          )}
        </CardContent>
      </AnimatedCard>
    </ErrorBoundary>
  )
}
