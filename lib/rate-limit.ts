import { NextRequest } from 'next/server';

export interface RateLimitOptions {
  uniqueIdentifier?: string;
  limit?: number;
  timeframe?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  message?: string;
  headers: Record<string, string>;
}

// Initialize cache for rate limiting
// import { LRUCache } from 'lru-cache';
// const cache = new LRUCache<string, number[]>({
//   max: 10000, // Store max 10k IPs
//   ttl: 1000 * 60 * 60, // Items expire after 1 hour
// });

// Replace with in-memory cache (if needed for MVP):
const cache = new Map<string, { data: number[]; expiry: number | null }>();

/**
 * Rate limiting function using in-memory LRU cache
 * Note: For production, consider using a distributed cache like Redis
 * Note: In-memory cache is used as MVP fallback
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const {
    uniqueIdentifier = 'default',
    limit = process.env.NODE_ENV === 'production' ? 60 : 1000,
    timeframe = 60,
  } = options;

  // Get client IP with fallbacks
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Create a unique key for this rate limit
  const key = `rate-limit:${uniqueIdentifier}:${ip}`;

  try {
    const now = Date.now();
    const windowStart = now - timeframe * 1000;

    // Get existing timestamps and filter old ones
    const existingCache = cache.get(key);
    let timestamps: number[];
    if (existingCache && existingCache.expiry && existingCache.expiry > now) {
      timestamps = existingCache.data;
    } else {
      timestamps = [];
    }
    const validTimestamps = timestamps.filter(time => time > windowStart);

    // Add current timestamp
    validTimestamps.push(now);
    cache.set(key, { data: validTimestamps, expiry: now + timeframe * 1000 });

    // Calculate remaining requests
    const count = validTimestamps.length;
    const remaining = Math.max(0, limit - count);
    const reset = now + timeframe * 1000;
    const success = count <= limit;

    // Prepare rate limit headers
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    };

    if (!success) {
      headers['Retry-After'] = timeframe.toString();
    }

    return {
      success,
      limit,
      remaining,
      reset,
      message: success ? undefined : 'Rate limit exceeded',
      headers,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);

    // Fail open with warning
    return {
      success: true,
      limit,
      remaining: 1,
      reset: Date.now() + timeframe * 1000,
      message: 'Rate limiting error, proceeding with caution',
      headers: {
        'X-RateLimit-Error': 'true',
      },
    };
  }
}
