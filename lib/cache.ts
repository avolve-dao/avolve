// lib/cache.ts
// Cache utility functions for Redis integration
// NOTE: Install 'ioredis' package with 'npm install ioredis' and add types with 'npm install @types/ioredis' when ready to use Redis.
// For now, the code falls back to in-memory caching if Redis is not available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Redis from 'ioredis'; // Suppress error temporarily until package is installed
import { env } from '@/lib/env';

// Initialize Redis client with environment variables
// Note: Actual Redis setup may not be in place yet; this will work once configured
// Handle missing env variables gracefully
const redis = process.env.REDIS_URL ? new Redis({
  host: (env as any).REDIS_HOST || 'localhost',
  port: (env as any).REDIS_PORT || 6379,
  password: (env as any).REDIS_PASSWORD || undefined,
}) : null;

if (!process.env.REDIS_URL) {
  console.warn('[Avolve] Redis is not configured (REDIS_URL missing). Falling back to in-memory cache. This is not recommended for production.');
}

// Fallback to in-memory cache if Redis is not configured
const inMemoryCache = new Map<string, { data: string; expiry: number | null }>(); 

/**
 * Get data from cache (Redis if available, else in-memory)
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export async function getCachedData(key: string): Promise<any | null> {
  if (redis) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  } else {
    // Fallback to in-memory cache
    const cached = inMemoryCache.get(key);
    if (!cached) return null;
    if (cached.expiry && Date.now() > cached.expiry) {
      inMemoryCache.delete(key);
      return null;
    }
    return JSON.parse(cached.data);
  }
}

/**
 * Set data in cache (Redis if available, else in-memory)
 * @param key Cache key
 * @param data Data to cache
 * @param ttlSeconds Time-to-live in seconds (optional)
 */
export async function setCachedData(key: string, data: any, ttlSeconds?: number): Promise<void> {
  const serializedData = JSON.stringify(data);
  if (redis) {
    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, serializedData);
      } else {
        await redis.set(key, serializedData);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  } else {
    // Fallback to in-memory cache
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    inMemoryCache.set(key, { data: serializedData, expiry });
  }
}

/**
 * Invalidate a cache entry (Redis if available, else in-memory)
 * @param key Cache key to delete
 */
export async function invalidateCache(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  } else {
    inMemoryCache.delete(key);
  }
}

/**
 * Generate a cache key based on request or parameters
 * @param reqOrPrefix Request object or prefix string
 * @param additional Additional parameters for key generation
 * @returns Generated cache key
 */
export function generateCacheKey(reqOrPrefix: Request | string, additional?: Record<string, any>): string {
  let prefix: string;
  let params: Record<string, any> = {};

  if (typeof reqOrPrefix === 'string') {
    prefix = reqOrPrefix;
  } else {
    const url = new URL(reqOrPrefix.url);
    prefix = url.pathname;
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  if (additional) {
    params = { ...params, ...additional };
  }

  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(':');

  return paramString ? `${prefix}:${paramString}` : prefix;
}

// Export a mock cache response for testing if Redis isn't set up
export async function getCachedResponse(key: string): Promise<string | null> {
  const data = await getCachedData(key);
  return data ? data.response : null;
}

export async function setCachedResponse(key: string, response: string, ttlSeconds: number = 300): Promise<void> {
  await setCachedData(key, { response }, ttlSeconds);
}

// Retain original in-memory LRU cache implementation for compatibility
// Comment out the original LRUCache usage to avoid errors if not installed
// import { LRUCache } from 'lru-cache';

// Cache configuration
const CACHE_MAX_SIZE = 100; // Maximum number of items in cache
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes TTL

// Create an LRU cache
// const cache = new LRUCache<string, any>({
//   max: CACHE_MAX_SIZE,
//   ttl: CACHE_TTL
// });
// For now, use the inMemoryCache Map as a simple replacement
const cache = new Map<string, any>();

/**
 * Generates a cache key from a request
 */
export function generateCacheKeyFromRequest(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Extract relevant parameters for uniqueness
  const params = [];
  for (const [key, value] of url.searchParams.entries()) {
    params.push(`${key}=${value}`);
  }
  
  return params.length > 0 ? `${path}?${params.join('&')}` : path;
}

/**
 * Attempts to get a cached response
 * @returns The cached value or null if not found
 */
export function getCachedResponseFromCache(key: string): any | null {
  return cache.get(key) || null;
}

/**
 * Stores a response in the cache
 */
export function setCachedResponseInCache(key: string, value: any, ttl?: number): void {
  cache.set(key, value);
  // Simulate TTL with a setTimeout to remove the item if ttl is provided
  if (ttl) {
    setTimeout(() => {
      cache.delete(key);
    }, ttl);
  }
}

/**
 * Invalidates a cached response
 */
export function invalidateCachedResponseInCache(key: string): void {
  cache.delete(key);
}

/**
 * Clears the entire cache
 */
export function clearCacheInCache(): void {
  cache.clear();
}

/**
 * Decorator to cache async function results
 * @param keyFn Function to generate cache key from arguments
 * @param ttl Time-to-live in milliseconds
 * @returns Decorated function that caches results
 */
export function cacheAsync<Args extends any[], T>(
  keyFn: (...args: Args) => string,
  ttl: number = CACHE_TTL
): (fn: (...args: Args) => Promise<T>) => (...args: Args) => Promise<T> {
  return (fn: (...args: Args) => Promise<T>) => async (...args: Args): Promise<T> => {
    const cacheKey = keyFn(...args);
    const cached = getCachedResponseFromCache(cacheKey);
    
    if (cached !== null) {
      return cached as T;
    }
    
    const result = await fn(...args);
    setCachedResponseInCache(cacheKey, result, ttl);
    return result;
  };
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
    const cached = getCachedResponseFromCache(cacheKey);
    
    if (cached !== null) {
      return cached as T;
    }
    
    const result = await fn(...args);
    setCachedResponseInCache(cacheKey, result, ttl);
    return result;
  };
}
