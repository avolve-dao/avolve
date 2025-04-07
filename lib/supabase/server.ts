'use client';

// This file is for both client and server components
// It uses the browser client to ensure compatibility

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

/**
 * Creates a Supabase client that works in both client and server contexts
 * 
 * IMPORTANT: This is a universal client that works everywhere
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-application-name': 'avolve-platform',
        },
      },
    }
  )
}
