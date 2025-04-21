// This file is for server components only
// For client components, use client.ts instead

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { cache } from 'react';

/**
 * Creates a Supabase client for use in server components and API routes
 * Uses React cache to prevent multiple instances during a request
 * 
 * IMPORTANT: This can only be used in Server Components!
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set(name, value, options),
      remove: (name, options) => cookieStore.set(name, '', { ...options, maxAge: 0 }),
    },
  });
});
