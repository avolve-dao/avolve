// This file is for server components only

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

/**
 * Creates a Supabase client for server components
 */
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
