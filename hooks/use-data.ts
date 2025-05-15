"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { CACHE_TTLS } from "@/constants"

// Cache for data
const dataCache = new Map<string, { data: any; timestamp: number }>()

interface UseDataOptions<T> {
  key: string
  initialData?: T
  cacheTtl?: number
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseDataResult<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook for fetching data with caching and error handling
 */
export function useData<T>(fetchFn: () => Promise<T>, options: UseDataOptions<T>): UseDataResult<T> {
  const { key, initialData = null, cacheTtl = CACHE_TTLS.MEDIUM, enabled = true, onSuccess, onError } = options

  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = dataCache.get(key)
    if (cached && Date.now() - cached.timestamp < cacheTtl) {
      setData(cached.data)
      return
    }

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const result = await fetchFn()

      // Update state
      setData(result)
      setIsLoading(false)

      // Update cache
      dataCache.set(key, {
        data: result,
        timestamp: Date.now(),
      })

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))

      // Update state
      setIsError(true)
      setError(errorObj)
      setIsLoading(false)

      // Call onError callback
      if (onError) {
        onError(errorObj)
      }
    }
  }, [fetchFn, key, cacheTtl, onSuccess, onError])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [enabled, fetchData])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchData,
  }
}

/**
 * Hook for fetching data from Supabase
 */
export function useSupabaseQuery<T>(
  table: string,
  query: (supabase: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: any }>,
  options: Omit<UseDataOptions<T>, "key"> & { key?: string } = {},
): UseDataResult<T> {
  const supabase = createClient()
  const key = options.key || `supabase:${table}:${Date.now()}`

  return useData<T>(
    async () => {
      const { data, error } = await query(supabase)

      if (error) {
        throw error
      }

      return data as T
    },
    {
      ...options,
      key,
    },
  )
}

/**
 * Invalidates a specific cache entry
 */
export function invalidateCache(key: string): void {
  dataCache.delete(key)
}

/**
 * Clears all cache entries
 */
export function clearCache(): void {
  dataCache.clear()
}
