import { LRUCache } from 'lru-cache';

// Cache configuration
const CACHE_MAX_SIZE = 100; // Maximum number of items in cache
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes in milliseconds

// Create LRU cache instance
const cache = new LRUCache<string, any>({
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL,
});

/**
 * Generates a cache key from a request
 */
export function generateCacheKey(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // For POST requests, include the request body in the cache key
  if (request.method === 'POST') {
    // Clone the request to read the body without consuming it
    return `${request.method}:${path}:${JSON.stringify(request.body)}`;
  }
  
  // For GET requests, include query parameters
  return `${request.method}:${path}:${url.search}`;
}

/**
 * Attempts to get a cached response
 * @returns The cached value or null if not found
 */
export function getCachedResponse(key: string): any | null {
  return cache.get(key) || null;
}

/**
 * Stores a response in the cache
 */
export function setCachedResponse(key: string, value: any, ttl?: number): void {
  cache.set(key, value, { ttl: ttl || CACHE_TTL });
}

/**
 * Invalidates a cached response
 */
export function invalidateCachedResponse(key: string): void {
  cache.delete(key);
}

/**
 * Clears the entire cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Wraps a function with caching
 * @param fn The function to cache
 * @param keyFn Function to generate a cache key
 * @param ttl Optional TTL override
 */
export function withCache<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  ttl?: number
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const cacheKey = keyFn(...args);
    const cached = getCachedResponse(cacheKey);
    
    if (cached !== null) {
      return cached as T;
    }
    
    const result = await fn(...args);
    setCachedResponse(cacheKey, result, ttl);
    return result;
  };
}
