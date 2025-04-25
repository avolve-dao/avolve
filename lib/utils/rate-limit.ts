// import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number;
  limit: number;
  uniqueTokenPerInterval: number;
};

/**
 * Rate limiting utility to prevent abuse of API endpoints
 * @param options Configuration options for rate limiting
 * @returns Object with check method to validate requests against rate limits
 */
export function rateLimit(options: RateLimitOptions) {
  const { interval, limit, uniqueTokenPerInterval } = options;

  // Replace with in-memory cache (if needed for MVP):
  const tokenCache = new Map<string, { data: number[]; expiry: number | null }>();

  return {
    /**
     * Check if a token has exceeded its rate limit
     * @param token Unique identifier for the requester (usually IP address)
     * @returns Object indicating success or failure of the rate limit check
     */
    check: async (
      token: string
    ): Promise<{ success: boolean; limit: number; remaining: number }> => {
      const now = Date.now();
      const cacheEntry = tokenCache.get(token);
      let timestamps: number[];

      if (cacheEntry && (cacheEntry.expiry === null || now < cacheEntry.expiry)) {
        timestamps = cacheEntry.data;
      } else {
        timestamps = [];
      }

      const validTimestamps = timestamps.filter(timestamp => now - timestamp < interval);

      // Add current timestamp
      validTimestamps.push(now);
      tokenCache.set(token, { data: validTimestamps, expiry: now + interval });

      const remaining = Math.max(0, limit - validTimestamps.length);
      const success = validTimestamps.length <= limit;

      return {
        success,
        limit,
        remaining,
      };
    },
  };
}
