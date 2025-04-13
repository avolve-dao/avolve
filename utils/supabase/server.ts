import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for server-side rendering.
 * @returns A Supabase client instance configured for server-side use.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => {
        // Implement a fallback method to get cookies if needed
        // For now, return undefined as a placeholder
        return undefined;
      },
      set: (name, value, options) => {
        // Implement a fallback method to set cookies if needed
      },
      remove: (name, options) => {
        // Implement a fallback method to remove cookies if needed
      },
    },
  });
}
