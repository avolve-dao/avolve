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
      get: (name: string) => {
        // Implement a fallback method to get cookies if needed
        // For now, return undefined as a placeholder
        return undefined;
      },
      set: (name: string, value: string, options?: any) => {
        // Implement a fallback method to set cookies if needed
        // For now, do nothing as a placeholder
        return;
      },
      remove: (name: string, options?: any) => {
        // Implement a fallback method to remove cookies if needed
        // For now, do nothing as a placeholder
        return;
      },
    },
  });
}
