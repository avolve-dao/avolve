import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for use in browser components
 * @returns Untyped Supabase client
 */
export const createBrowserClient = () => {
  const supabaseUrl = 'https://hevrachacwtqdcktblsd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldnJhY2hhY3d0cWRja3RibHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzAxODcsImV4cCI6MjA1NTUwNjE4N30.4r8J5bFjPntWUxoaN16MMe2iD_rOvqqS4rFZtqHYtvo';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are not set. Using a fallback client.');
    return createFallbackClient();
  }

  try {
    // Check if URL is valid
    new URL(supabaseUrl);
    return createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      },
      global: {
        headers: {
          'x-application-name': 'avolve-platform',
        },
      },
    });
  } catch (error) {
    console.error('Invalid Supabase URL:', error instanceof Error ? error.message : 'Unknown error');
    console.warn('Using a fallback client due to invalid URL.');
    return createFallbackClient();
  }
};

// Alias createBrowserClient as createClient for backward compatibility
export const createClient = createBrowserClient;

// Fallback client for when Supabase initialization fails
function createFallbackClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        then: (cb: (result: { data: unknown[]; error: Error }) => void) => cb({ data: [], error: new Error('Supabase client not initialized') }),
      }),
    }),
  } as any;
}
