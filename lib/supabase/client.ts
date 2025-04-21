import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

/**
 * Creates a Supabase client for use in browser/client components
 */
// Accepts options for server-side usage, but defaults to client-side
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
    },
    global: {
      headers: {
        'x-application-name': 'avolve-platform',
      },
    },
    ...options,
  });
};
