'use client';

import { Database } from '@/lib/database.types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client that can be used in client components
 * This is a safe alternative to the server.ts implementation
 */
export const createUniversalClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
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
};
