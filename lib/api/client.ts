/**
 * Avolve API Client
 * 
 * This file provides a base client for interacting with the Supabase database.
 * It handles common functionality like error handling, caching, retries, and response formatting.
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { TypedSupabaseClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Error class for API errors
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  
  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Options for API requests
 */
export interface ApiOptions {
  /** Whether to use cache for this request */
  useCache?: boolean;
  /** Cache time-to-live in milliseconds */
  cacheTtl?: number;
  /** Number of retry attempts for failed requests */
  retries?: number;
  /** Whether to throw errors (true) or return them as part of the response (false) */
  throwErrors?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    /** Total count of items */
    totalCount: number;
    /** Current page number */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total pages */
    totalPages: number;
    /** Next cursor for cursor-based pagination */
    nextCursor?: string;
    /** Has more pages */
    hasMore: boolean;
  };
}

/**
 * Base API client
 */
export class ApiClient {
  protected client: TypedSupabaseClient;
  protected activeSubscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor(client: TypedSupabaseClient) {
    this.client = client;
  }
  
  /**
   * Create a server-side API client
   */
  static createServerClient() {
    return new ApiClient(createServerClient());
  }
  
  /**
   * Create a browser-side API client
   */
  static createBrowserClient() {
    return new ApiClient(createBrowserClient());
  }
  
  /**
   * Generate a cache key from the request parameters
   */
  protected generateCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${params ? JSON.stringify(params) : ''}`;
  }
  
  /**
   * Get data from cache if available and not expired
   */
  protected getFromCache<T>(cacheKey: string): T | null {
    const cached = cache.get(cacheKey);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > DEFAULT_CACHE_TTL) {
      cache.delete(cacheKey);
      return null;
    }
    
    return cached.data as T;
  }
  
  /**
   * Store data in cache
   */
  protected setCache(cacheKey: string, data: any, ttl: number = DEFAULT_CACHE_TTL): void {
    // Don't cache null or undefined values
    if (data === null || data === undefined) return;
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now() + ttl
    });
    
    // Clean up old cache entries periodically
    this.cleanupCache();
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, value] of cache.entries()) {
      if (now > value.timestamp) {
        cache.delete(key);
      }
    }
  }
  
  /**
   * Clear the entire cache or a specific key
   */
  protected clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cache.delete(cacheKey);
    } else {
      cache.clear();
    }
  }
  
  /**
   * Execute a request with retries and caching
   */
  protected async executeRequest<T>(
    requestFn: () => Promise<{ data: T | null; error: any }>,
    options: ApiOptions = {},
    cacheKey?: string
  ): Promise<T> {
    const {
      useCache = true,
      cacheTtl = DEFAULT_CACHE_TTL,
      retries = 1,
      throwErrors = true
    } = options;
    
    // Try to get from cache first if caching is enabled
    if (useCache && cacheKey) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    let lastError: any = null;
    let attempt = 0;
    
    while (attempt <= retries) {
      try {
        const { data, error } = await requestFn();
        
        if (error) {
          lastError = error;
          attempt++;
          
          // If we've exceeded retries, handle the error
          if (attempt > retries) {
            if (throwErrors) {
              this.handleError(error);
            } else {
              return null as unknown as T;
            }
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          continue;
        }
        
        // Store in cache if caching is enabled
        if (useCache && cacheKey && data) {
          this.setCache(cacheKey, data, cacheTtl);
        }
        
        return data as T;
      } catch (error) {
        lastError = error;
        attempt++;
        
        if (attempt > retries) {
          if (throwErrors) {
            this.handleError(error);
          } else {
            return null as unknown as T;
          }
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
    
    // This should never be reached due to the error handling above
    if (throwErrors) {
      this.handleError(lastError);
    }
    return null as unknown as T;
  }
  
  /**
   * Handle Supabase errors
   */
  protected handleError(error: any, message: string = 'An error occurred'): never {
    console.error('API Error:', error);
    
    // Handle Supabase-specific errors
    if (error?.code && error?.message) {
      // Authentication errors
      if (error.code === 'auth/invalid-credentials') {
        throw new ApiError('Invalid credentials', 401, error.code, error.details);
      }
      
      // Permission errors
      if (error.code === 'PGRST116') {
        throw new ApiError('Insufficient permissions', 403, error.code, error.details);
      }
      
      // Not found errors
      if (error.code === 'PGRST204') {
        throw new ApiError('Resource not found', 404, error.code, error.details);
      }
      
      // Rate limiting
      if (error.code === '429') {
        throw new ApiError('Too many requests', 429, error.code, error.details);
      }
    }
    
    if (error?.status) {
      throw new ApiError(`${message}: ${error.message}`, error.status, error.code, error.details);
    }
    
    throw new ApiError(`${message}: ${error?.message || 'Unknown error'}`, 500);
  }
  
  /**
   * Create a paginated query
   */
  protected paginateQuery<T>(
    query: any,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, pageSize = 10 } = pagination;
    const offset = (page - 1) * pageSize;
    
    // Clone the query for count
    const countQuery = query.clone();
    
    // Execute count query
    return Promise.all([
      // Get total count
      countQuery.count('exact'),
      // Get paginated data
      query.range(offset, offset + pageSize - 1)
    ]).then(([countResult, dataResult]) => {
      const { error: countError, count } = countResult;
      const { data, error: dataError } = dataResult;
      
      if (countError) this.handleError(countError, 'Error getting count');
      if (dataError) this.handleError(dataError, 'Error getting data');
      
      const totalPages = Math.ceil(count / pageSize);
      
      return {
        data: data || [],
        metadata: {
          totalCount: count,
          page,
          pageSize,
          totalPages,
          hasMore: page < totalPages
        }
      };
    });
  }
  
  /**
   * Subscribe to real-time changes
   * @param table The database table to subscribe to
   * @param event The event type to listen for
   * @param callback Function to call when an event occurs
   * @param filter Optional filter string
   * @returns Function to unsubscribe
   */
  protected subscribeToChanges(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    filter?: string
  ): () => void {
    const subscriptionKey = `${table}:${event}:${filter || ''}`;
    
    // Check if subscription already exists
    if (this.activeSubscriptions.has(subscriptionKey)) {
      return () => this.unsubscribe(subscriptionKey);
    }
    
    // Create channel
    const channel = this.client
      .channel(subscriptionKey)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter
        },
        callback
      )
      .subscribe();
    
    // Store subscription
    this.activeSubscriptions.set(subscriptionKey, channel);
    
    // Return unsubscribe function
    return () => this.unsubscribe(subscriptionKey);
  }
  
  /**
   * Unsubscribe from real-time changes
   */
  protected unsubscribe(subscriptionKey: string): void {
    const channel = this.activeSubscriptions.get(subscriptionKey);
    
    if (channel) {
      channel.unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
    }
  }
  
  /**
   * Unsubscribe from all real-time changes
   */
  protected unsubscribeAll(): void {
    for (const [key, channel] of this.activeSubscriptions.entries()) {
      channel.unsubscribe();
      this.activeSubscriptions.delete(key);
    }
  }
}
