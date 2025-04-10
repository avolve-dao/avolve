// This file is for server components only

import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'
import { env } from '@/lib/env'

// For pages directory and other non-app directory environments
export function createPagesClient() {
  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => undefined,
        set: (name, value, options) => {},
        remove: (name, options) => {},
      },
    }
  )
}

// For app directory server components
export function createServerComponentClient() {
  try {
    // This will only work in app directory server components
    // We use a dynamic import to avoid issues with pages directory
    const { cookies } = require('next/headers')
    const cookieStore = cookies()
    
    return createServerClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => {
            return cookieStore.get(name)?.value
          },
          set: (name, value, options) => {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              // Silently fail if we're in a environment where cookies can't be set
            }
          },
          remove: (name, options) => {
            try {
              cookieStore.delete(name, options)
            } catch (error) {
              // Silently fail if we're in a environment where cookies can't be removed
            }
          },
        },
      }
    )
  } catch (error) {
    // Fallback for environments where cookies() is not available (like pages directory)
    console.warn('Using fallback Supabase client. This should only happen in pages/ directory.')
    return createPagesClient()
  }
}

// Legacy function for backward compatibility
export function createClient() {
  return createServerComponentClient()
}
