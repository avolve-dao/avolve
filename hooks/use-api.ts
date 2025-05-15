"use client"

import { useState, useCallback, useEffect } from "react"
import { CACHE_TTLS } from "@/constants"

interface UseApiOptions<T> {
  initialData?: T
  cacheKey?: string
  cacheTtl?: number // in milliseconds
}

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

// Simple in-memory cache
const apiCache = new Map<string, { data: any; timestamp: number }>()

export function useApi<T>(fetchFn: () => Promise<T>, options: UseApiOptions<T> = {}) {
  const { initialData = null, cacheKey, cacheTtl = CACHE_TTLS.MEDIUM } = options

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    isError: false,
    error: null,
  })

  const fetchData = useCallback(
    async (force = false) => {
      // Check cache first if cacheKey is provided
      if (cacheKey && !force) {
        const cached = apiCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < cacheTtl) {
          setState({
            data: cached.data,
            isLoading: false,
            isError: false,
            error: null,
          })
          return
        }
      }

      setState((prev) => ({ ...prev, isLoading: true }))

      try {
        const data = await fetchFn()

        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
        })

        // Update cache if cacheKey is provided
        if (cacheKey) {
          apiCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          })
        }
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    },
    [fetchFn, cacheKey, cacheTtl],
  )

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch: () => fetchData(true),
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
