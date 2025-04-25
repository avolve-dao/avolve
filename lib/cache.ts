// lib/cache.ts
// Purged Redis integration. Pure in-memory cache for MVP (Supabase handles persistence).
// No external dependencies required.

// Cache configuration
const CACHE_MAX_SIZE = 100; // Maximum number of items in cache
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes TTL

const cache = new Map<string, { data: any; expiry: number | null }>();

export function generateCacheKey(
  reqOrPrefix: Request | string,
  additional?: Record<string, any>
): string {
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

export function generateCacheKeyFromRequest(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname;
  const params = [];
  for (const [key, value] of url.searchParams.entries()) {
    params.push(`${key}=${value}`);
  }
  return params.length > 0 ? `${path}?${params.join('&')}` : path;
}

export async function getCachedResponse(key: string): Promise<any | null> {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry && entry.expiry !== null && Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data.response;
}

export async function setCachedResponse(
  key: string,
  response: any,
  ttl: number = CACHE_TTL
): Promise<void> {
  if (cache.size > CACHE_MAX_SIZE) {
    // Simple FIFO eviction
    const firstKey = cache.keys().next().value;
    if (typeof firstKey === 'string') {
      cache.delete(firstKey);
    }
  }
  cache.set(key, { data: { response }, expiry: Date.now() + ttl });
}

export async function setCachedData(
  key: string,
  data: any,
  ttl: number = CACHE_TTL
): Promise<void> {
  return setCachedResponse(key, data, ttl);
}

export async function getCachedData(key: string): Promise<any | null> {
  return getCachedResponse(key);
}

export function clearCacheInCache(): void {
  cache.clear();
}

export async function invalidateCache(key: string): Promise<void> {
  cache.delete(key);
}

export function cacheAsync<Args extends any[], T>(
  keyFn: (...args: Args) => string,
  ttl: number = CACHE_TTL
): (fn: (...args: Args) => Promise<T>) => (...args: Args) => Promise<T> {
  return (fn: (...args: Args) => Promise<T>) =>
    async (...args: Args): Promise<T> => {
      const cacheKey = keyFn(...args);
      const cached = await getCachedResponse(cacheKey);
      if (cached !== null) {
        return cached as T;
      }
      const result = await fn(...args);
      await setCachedResponse(cacheKey, result, ttl);
      return result;
    };
}

export function withCache<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  ttl?: number
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const cacheKey = keyFn(...args);
    const cached = await getCachedResponse(cacheKey);
    if (cached !== null) {
      return cached as T;
    }
    const result = await fn(...args);
    await setCachedResponse(cacheKey, result, ttl);
    return result;
  };
}
