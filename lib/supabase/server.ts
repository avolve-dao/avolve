// This file is for server components only

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import { cache } from 'react'

/**
 * Creates a Supabase client for server components with caching
 * This uses the new Supabase SSR package with cookies handling
 */
export const createServerComponentClient = cache(() => {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
      // Configure database options for optimal performance
      db: {
        schema: 'public'
      },
    }
  )
})

// Legacy function for backward compatibility
export function createClient() {
  return createServerComponentClient()
}
