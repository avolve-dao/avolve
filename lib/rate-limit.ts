import { type NextRequest, NextResponse } from "next/server"
import { RATE_LIMITS, ERROR_MESSAGES } from "@/constants"

interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
}

// In-memory store for rate limiting
// In production, you might want to use Redis or another distributed store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(options: RateLimitOptions = {}) {
  const { windowMs = RATE_LIMITS.DEFAULT.WINDOW_MS, maxRequests = RATE_LIMITS.DEFAULT.MAX_REQUESTS } = options

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    // Get client IP
    const ip = request.ip || "unknown"
    const now = Date.now()

    // Get or create rate limit data for this IP
    let rateLimitData = rateLimitStore.get(ip)

    if (!rateLimitData || now > rateLimitData.resetTime) {
      // First request or window expired, create new entry
      rateLimitData = {
        count: 1,
        resetTime: now + windowMs,
      }
      rateLimitStore.set(ip, rateLimitData)

      // Clean up old entries periodically
      setTimeout(() => {
        rateLimitStore.delete(ip)
      }, windowMs)

      // Allow the request
      return handler()
    }

    // Increment request count
    rateLimitData.count++

    // Check if over limit
    if (rateLimitData.count > maxRequests) {
      // Calculate remaining time until reset
      const remainingMs = rateLimitData.resetTime - now
      const remainingSecs = Math.ceil(remainingMs / 1000)

      // Return rate limit response
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMITED },
        {
          status: 429,
          headers: {
            "Retry-After": String(remainingSecs),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateLimitData.resetTime / 1000)),
          },
        },
      )
    }

    // Update store
    rateLimitStore.set(ip, rateLimitData)

    // Allow the request
    return handler()
  }
}
