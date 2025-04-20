// This file is for server components only
// For client components, use client.ts instead

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import { cache } from 'react'

/**
 * Creates a Supabase client for use in server components and API routes
 * Uses React cache to prevent multiple instances during a request
 * 
 * IMPORTANT: This can only be used in Server Components!
 */
export const createClient = cache(async () => {
  // This will only be used in server components
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name, value, options) {
          try {
            await cookieStore.set(name, value, options)
          } catch (error) {
            // This might happen in middleware or other contexts
            console.error('Error setting cookie:', error)
          }
        },
        async remove(name, options) {
          try {
            await cookieStore.delete({ name, ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
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
})
