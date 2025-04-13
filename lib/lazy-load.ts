import dynamic from "next/dynamic"
import type { ComponentType } from "react"

// Default loading component
const DefaultLoading = () => <div className="p-4 text-center">Loading...</div>

// Default error component
const DefaultError = ({ error }: { error: Error }) => (
  <div className="p-4 text-center text-red-500">Error loading component: {error.message}</div>
)

/**
 * Utility function to lazy load components with better error handling and loading states
 */
export function lazyLoad<T>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  { loading = DefaultLoading, error = DefaultError, ssr = false, suspense = false } = {},
) {
  return dynamic(importFunc, {
    loading,
    ssr,
    suspense,
    // @ts-ignore - Next.js types don't include this, but it works
    loadableGenerated: {
      webpack: () => [require.resolveWeak(importFunc.toString())],
    },
  })
}

