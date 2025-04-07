'use client';

import { Database } from '@/lib/database.types';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client that can be used in client components
 * This is a safe alternative to the server.ts implementation
 */
export function createUniversalClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}
