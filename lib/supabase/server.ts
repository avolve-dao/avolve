// This file is for server components only

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { env } from '@/lib/env';

/**
 * Creates a Supabase client for use in server components and API routes
 * Uses cookies for SSR/session support.
 */
export function createServerComponentClient() {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  try {
    // This will only work in app directory server components
    // We use a dynamic import to avoid issues with pages directory
    const { cookies } = require('next/headers')
    const cookieStore = cookies()
    
    return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      // Optionally, add cookie handling here for SSR if needed
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
    })
  } catch (error) {
    // Fallback for environments where cookies() is not available (like pages directory)
    console.warn('Using fallback Supabase client. This should only happen in pages/ directory.')
    return createSupabaseClient<Database>(supabaseUrl, supabaseKey)
  }
}

// Legacy compatibility for pages/ directory
export function createPagesClient() {
  return createServerComponentClient();
}

// Universal client for environments where you don't know if you're SSR/client
export function createClient() {
  return createServerComponentClient();
}
