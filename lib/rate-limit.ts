// Simple in-memory store for rate limiting
// Note: This is reset when the serverless function cold starts
const rateLimitStore: Record<string, { count: number; timestamp: number }> = {}

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_REQUESTS = 10 // Maximum requests per window

export async function rateLimit(request: Request) {
  // Use IP address as identifier
  const ip = request.headers.get("x-forwarded-for") || "anonymous"
  const path = new URL(request.url).pathname

  // Create a unique key for this IP and endpoint
  const key = `rate-limit:${ip}:${path}`

  // Get current time
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Get existing record or create new one
  const record = rateLimitStore[key]
  let newRecord: { count: number; timestamp: number }

  if (!record || record.timestamp < windowStart) {
    // First request in a new window
    newRecord = { count: 1, timestamp: now }
  } else {
    // Increment existing record
    newRecord = { count: record.count + 1, timestamp: now }
  }

  // Store the updated record
  rateLimitStore[key] = newRecord

  // Check if rate limit is exceeded
  const remaining = Math.max(0, MAX_REQUESTS - newRecord.count)
  const reset = new Date(windowStart + RATE_LIMIT_WINDOW).toISOString()

  // Set rate limit headers
  const headers = new Headers()
  headers.set("X-RateLimit-Limit", MAX_REQUESTS.toString())
  headers.set("X-RateLimit-Remaining", remaining.toString())
  headers.set("X-RateLimit-Reset", reset)

  // If rate limit is exceeded, return 429 Too Many Requests
  if (newRecord.count > MAX_REQUESTS) {
    return {
      success: false,
      headers,
      message: "Too many requests, please try again later.",
    }
  }

  return { success: true, headers }
}

