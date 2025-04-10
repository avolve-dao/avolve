import { NextRequest } from 'next/server'
import { env } from '@/lib/env'

// In-memory store for rate limiting
// Note: This will reset when the serverless function cold starts
const inMemoryStore = new Map<string, { count: number; timestamp: number }>()

interface RateLimitOptions {
  uniqueIdentifier?: string;
  limit?: number;
  timeframe?: number; // in seconds
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp
  message?: string;
  headers: Headers;
}

/**
 * Rate limiting function for serverless environments
 * 
 * This implementation uses an in-memory store which works well for
 * development and small-scale deployments. For production at scale,
 * consider implementing a distributed rate limiting solution with Redis.
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const {
    uniqueIdentifier = 'default',
    limit = 60,
    timeframe = 60, // 1 minute
  } = options

  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous'
  
  // Create a unique key for this rate limit
  const key = `rate-limit:${uniqueIdentifier}:${ip}`
  
  // Current timestamp in seconds
  const now = Math.floor(Date.now() / 1000)
  
  // Reset timestamp
  const reset = now + timeframe
  
  // Create headers for rate limit response
  const headers = new Headers()
  
  try {
    // Get current count from in-memory store
    const current = inMemoryStore.get(key) || { count: 0, timestamp: now }
    
    // Check if the timeframe has expired
    if (now - current.timestamp >= timeframe) {
      // Reset the counter if the timeframe has expired
      current.count = 1
      current.timestamp = now
    } else {
      // Increment the counter
      current.count++
    }
    
    // Store the updated count
    inMemoryStore.set(key, current)
    
    // Check if limit is exceeded
    const success = current.count <= limit
    const remaining = Math.max(0, limit - current.count)
    
    // Set rate limit headers
    headers.set('X-RateLimit-Limit', limit.toString())
    headers.set('X-RateLimit-Remaining', remaining.toString())
    headers.set('X-RateLimit-Reset', reset.toString())
    
    if (!success) {
      headers.set('Retry-After', timeframe.toString())
    }
    
    // Clean up old entries to prevent memory leaks (every ~5 minutes)
    if (Math.random() < 0.01) {
      for (const [entryKey, entry] of inMemoryStore.entries()) {
        if (now - entry.timestamp >= timeframe * 5) {
          inMemoryStore.delete(entryKey)
        }
      }
    }
    
    return {
      success,
      limit,
      remaining,
      reset,
      message: success ? undefined : 'Rate limit exceeded',
      headers,
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    
    // If rate limiting fails, allow the request to proceed
    // This is a fail-open approach for better user experience
    return {
      success: true,
      limit,
      remaining: 1,
      reset,
      message: 'Rate limiting error, proceeding anyway',
      headers,
    }
  }
}
