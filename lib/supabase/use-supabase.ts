import { useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UseSupabaseResult {
  supabase: SupabaseClient;
}

export function useSupabase(): UseSupabaseResult {
  const [supabase] = useState(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, supabaseAnonKey);
  });

  return { supabase };
}
