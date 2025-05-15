"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { CACHE_TTLS } from "@/constants"
import { useFeedbackToast } from "@/components/feedback-toast"
import { ErrorType, ErrorSeverity, handleError } from "@/lib/error-handler"

interface UseApiWithRetryOptions<T> {
  initialData?: T
  cacheKey?: string
  cacheTtl?: number
  maxRetries?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  errorMessage?: string
  showErrorToast?: boolean
}

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  retryCount: number
  isRetrying: boolean
}

// Simple in-memory cache
const apiCache = new Map<string, { data: any; timestamp: number }>()

export function useApiWithRetry<T>(fetchFn: () => Promise<T>, options: UseApiWithRetryOptions<T> = {}) {
  const {
    initialData = null,
    cacheKey,
    cacheTtl = CACHE_TTLS.MEDIUM,
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    errorMessage = "An error occurred while fetching data",
    showErrorToast = true,
  } = options

  const { showFeedback } = useFeedbackToast()
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    isError: false,
    error: null,
    retryCount: 0,
    isRetrying: false,
  })

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }

  const fetchData = useCallback(
    async (force = false, retryAttempt = 0) => {
      // Clear any existing retry timeout
      clearRetryTimeout()

      // Check cache first if cacheKey is provided and not forcing refresh
      if (cacheKey && !force) {
        const cached = apiCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < cacheTtl) {
          setState((prev) => ({
            ...prev,
            data: cached.data,
            isLoading: false,
            isError: false,
            error: null,
            retryCount: 0,
            isRetrying: false,
          }))

          if (onSuccess) {
            onSuccess(cached.data)
          }

          return
        }
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isRetrying: retryAttempt > 0,
        retryCount: retryAttempt,
      }))

      try {
        const data = await fetchFn()

        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
          retryCount: 0,
          isRetrying: false,
        })

        // Update cache if cacheKey is provided
        if (cacheKey) {
          apiCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          })
        }

        if (onSuccess) {
          onSuccess(data)
        }
      } catch (error) {
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("network") ||
            error.message.includes("fetch") ||
            error.message.includes("connection") ||
            error.message.includes("timeout"))

        // Determine if we should retry
        const shouldRetry = isNetworkError && retryAttempt < maxRetries

        setState({
          data: null,
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error(String(error)),
          retryCount: retryAttempt,
          isRetrying: shouldRetry,
        })

        if (shouldRetry) {
          // Exponential backoff for retries
          const delay = retryDelay * Math.pow(2, retryAttempt)

          // Show retrying toast
          showFeedback({
            type: "info",
            title: "Connection issue",
            description: `Retrying in ${delay / 1000} seconds... (${retryAttempt + 1}/${maxRetries})`,
            duration: delay - 500, // Show until just before retry
          })

          retryTimeoutRef.current = setTimeout(() => {
            fetchData(true, retryAttempt + 1)
          }, delay)
        } else if (error instanceof Error) {
          // Handle the error after all retries have failed
          handleError(
            error,
            isNetworkError ? ErrorType.NETWORK : ErrorType.UNKNOWN,
            { action: "fetchData" },
            ErrorSeverity.ERROR,
            showErrorToast,
          )

          if (onError) {
            onError(error)
          }
        }
      }
    },
    [fetchFn, cacheKey, cacheTtl, maxRetries, retryDelay, onSuccess, onError, showErrorToast, showFeedback],
  )

  // Fetch data on mount
  useEffect(() => {
    fetchData()

    return () => {
      clearRetryTimeout()
    }
  }, [fetchData])

  // Expose methods to manually control the API call
  const retry = useCallback(() => {
    fetchData(true, 0)
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData(true, 0)
  }, [fetchData])

  return {
    ...state,
    retry,
    refetch,
  }
}

// Function to clear specific cache entry
export function clearApiCache(key: string) {
  apiCache.delete(key)
}

// Function to clear all cache
export function clearAllApiCache() {
  apiCache.clear()
}
