import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

/**
 * Creates a Supabase client for use in browser components
 * @returns Typed Supabase client
 */
export function createClient() {
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
  )
}
