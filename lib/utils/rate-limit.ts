import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number
  limit: number
  uniqueTokenPerInterval: number
}

/**
 * Rate limiting utility to prevent abuse of API endpoints
 * @param options Configuration options for rate limiting
 * @returns Object with check method to validate requests against rate limits
 */
export function rateLimit(options: RateLimitOptions) {
  const { interval, limit, uniqueTokenPerInterval } = options
  
  const tokenCache = new LRUCache<string, number[]>({
    max: uniqueTokenPerInterval,
    ttl: interval,
  })

  return {
    /**
     * Check if a token has exceeded its rate limit
     * @param token Unique identifier for the requester (usually IP address)
     * @returns Object indicating success or failure of the rate limit check
     */
    check: async (token: string): Promise<{ success: boolean; limit: number; remaining: number }> => {
      const now = Date.now()
      const timestamps = tokenCache.get(token) || []
      const validTimestamps = timestamps.filter((timestamp) => now - timestamp < interval)
      
      // Add current timestamp
      validTimestamps.push(now)
      tokenCache.set(token, validTimestamps)
      
      const remaining = Math.max(0, limit - validTimestamps.length)
      const success = validTimestamps.length <= limit
      
      return {
        success,
        limit,
        remaining,
      }
    },
  }
}
