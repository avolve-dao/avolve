"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<T[]>
  initialPage?: number
  pageSize?: number
  hasMoreFn?: (data: T[], totalItems: number) => boolean
  threshold?: number // Distance from bottom to trigger next page load (in pixels)
}

export function useInfiniteScroll<T>(options: UseInfiniteScrollOptions<T>) {
  const {
    fetchFn,
    initialPage = 0,
    pageSize = 10,
    hasMoreFn = (data, total) => data.length < total,
    threshold = 200,
  } = options

  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return

      if (observer.current) {
        observer.current.disconnect()
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1)
          }
        },
        { rootMargin: `0px 0px ${threshold}px 0px` },
      )

      if (node) {
        observer.current.observe(node)
      }
    },
    [isLoading, hasMore, threshold],
  )

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const newItems = await fetchFn(page)

      setData((prevData) => {
        const combinedData = [...prevData, ...newItems]
        setHasMore(hasMoreFn(combinedData, totalItems))
        return combinedData
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, page, isLoading, hasMore, hasMoreFn, totalItems])

  // Load data when page changes
  useEffect(() => {
    loadMore()
  }, [page, loadMore])

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    hasMore,
    lastElementRef,
    setTotalItems,
    refresh: () => {
      setData([])
      setPage(initialPage)
      setHasMore(true)
    },
  }
}
