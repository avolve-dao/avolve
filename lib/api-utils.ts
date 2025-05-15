import { NextResponse, type NextRequest } from "next/server"

// Types for API handlers
export type ApiHandler = (
  req: NextRequest,
  params?: Record<string, string | string[]>,
) => Promise<Response | NextResponse>

// Types for API response
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

// Cache control options
export interface CacheOptions {
  maxAge?: number // in seconds
  staleWhileRevalidate?: number // in seconds
  private?: boolean
  noStore?: boolean
}

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  maxAge: 60, // 1 minute
  staleWhileRevalidate: 600, // 10 minutes
  private: false,
  noStore: false,
}

/**
 * Generate cache control header based on options
 */
export function generateCacheControlHeader(options: CacheOptions = {}): string {
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options }

  if (opts.noStore) {
    return "no-store, no-cache, must-revalidate, proxy-revalidate"
  }

  const directives = []

  if (opts.private) {
    directives.push("private")
  } else {
    directives.push("public")
  }

  if (opts.maxAge !== undefined) {
    directives.push(`max-age=${opts.maxAge}`)
  }

  if (opts.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${opts.staleWhileRevalidate}`)
  }

  return directives.join(", ")
}

/**
 * Create a JSON response with proper headers
 */
export function createApiResponse<T>(
  data: T | null = null,
  status = 200,
  error: string | null = null,
  cacheOptions?: CacheOptions,
): NextResponse {
  const responseHeaders = new Headers()

  // Set cache control header
  responseHeaders.set("Cache-Control", generateCacheControlHeader(cacheOptions))

  // Set content type
  responseHeaders.set("Content-Type", "application/json")

  // Create response body
  const responseBody: ApiResponse<T> = {
    status,
    ...(data !== null && { data }),
    ...(error !== null && { error }),
  }

  return NextResponse.json(responseBody, {
    status,
    headers: responseHeaders,
  })
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, defaultMessage = "An unexpected error occurred"): NextResponse {
  console.error("API Error:", error)

  if (error instanceof Error) {
    return createApiResponse(null, 500, error.message, { noStore: true })
  }

  return createApiResponse(null, 500, defaultMessage, { noStore: true })
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: NextRequest): string {
  // Try to get from Vercel-specific headers
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  // Try to get from request
  const ip = req.ip
  if (ip) {
    return ip
  }

  // Fallback
  return "unknown"
}

/**
 * Create an optimized API route handler with error handling and caching
 */
export function createApiHandler(handler: ApiHandler, cacheOptions?: CacheOptions): ApiHandler {
  return async (req: NextRequest, params?: Record<string, string | string[]>) => {
    try {
      // Add request timing
      const startTime = performance.now()

      // Execute the handler
      const response = await handler(req, params)

      // Calculate request duration
      const duration = performance.now() - startTime

      // Add timing header if not already present
      if (response instanceof NextResponse && !response.headers.has("Server-Timing")) {
        response.headers.set("Server-Timing", `handler;dur=${duration.toFixed(2)}`)
      }

      return response
    } catch (error) {
      return handleApiError(error)
    }
  }
}
