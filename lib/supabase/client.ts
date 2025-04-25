import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { captureException } from '@/lib/monitoring/error-tracking';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Creates a Supabase client for use in browser/client components
 * @param supabaseUrl - Optional custom Supabase URL
 * @param supabaseKey - Optional custom Supabase key
 * @param options - Optional additional client options
 * @returns Supabase client instance
 */
export const createClient = (supabaseUrl?: string, supabaseKey?: string, options?: any) => {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createSupabaseClient<Database>(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'avolve-auth-token',
    },
    global: {
      headers: {
        'x-application-name': 'avolve-platform',
        'x-client-info': 'avolve-web-client',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    db: {
      schema: 'public',
    },
    ...options,
  });
};

/**
 * Creates a Supabase admin client with service role permissions
 * Only use server-side in trusted contexts
 * @returns Supabase admin client instance
 */
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }
  
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': 'avolve-platform-admin',
      },
    },
  });
};

/**
 * Helper function to implement retry logic for database operations
 * @param operation - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Delay between retries in ms
 * @returns Promise resolving to the operation result
 */
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      
      // Convert to Error object if it's not already
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry for certain errors (e.g., not found, permission denied)
      if (errorObj.message?.includes('not found') || 
          errorObj.message?.includes('permission denied') ||
          errorObj.message?.includes('invalid input')) {
        throw errorObj;
      }
      
      // Only retry for network-related errors or rate limiting
      if (!errorObj.message?.includes('network') && 
          !errorObj.message?.includes('timeout') && 
          !errorObj.message?.includes('connection') &&
          !errorObj.message?.includes('rate limit')) {
        throw errorObj;
      }
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Standardized session handler for Supabase
 * @param client - Supabase client instance
 * @returns Object with session handling methods
 */
export const createSessionHandler = (client = createClient()) => {
  return {
    /**
     * Get the current session
     * @returns Current session or null
     */
    getSession: async () => {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data.session;
      } catch (error) {
        captureException('Error getting session', error);
        return null;
      }
    },
    
    /**
     * Get the current user
     * @returns Current user or null
     */
    getUser: async () => {
      try {
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        return data.user;
      } catch (error) {
        captureException('Error getting user', error);
        return null;
      }
    },
    
    /**
     * Refresh the session
     * @returns Refreshed session or null
     */
    refreshSession: async () => {
      try {
        const { data, error } = await client.auth.refreshSession();
        if (error) throw error;
        return data.session;
      } catch (error) {
        captureException('Error refreshing session', error);
        return null;
      }
    },
    
    /**
     * Set the session
     * @param accessToken - Access token
     * @param refreshToken - Refresh token
     * @returns Session or null
     */
    setSession: async (accessToken: string, refreshToken: string) => {
      try {
        const { data, error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        return data.session;
      } catch (error) {
        captureException('Error setting session', error);
        return null;
      }
    },
  };
};
