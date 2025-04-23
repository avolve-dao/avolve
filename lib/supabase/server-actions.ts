'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in server actions
 * This is separate from the server.ts file to avoid 'use server' directive issues
 */
export async function createServerActionClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
}
