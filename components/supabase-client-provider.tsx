'use client';

import React, { createContext } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client in a client component
const supabaseUrl = 'https://hevrachacwtqdcktblsd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldnJhY2hhY3d0cWRja3RibHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzAxODcsImV4cCI6MjA1NTUwNjE4N30.4r8J5bFjPntWUxoaN16MMe2iD_rOvqqS4rFZtqHYtvo';

// Function to validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if environment variables are set and valid before creating client
let supabaseClient: SupabaseClient<Database> | undefined;
try {
  if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase environment variables are not set or URL is invalid. Using a dummy client for development.');
    // Provide a dummy client or undefined to avoid initialization errors
    supabaseClient = undefined;
  }
} catch (error: unknown) {
  console.error('Error initializing Supabase client:', error instanceof Error ? error.message : 'Unknown error');
  supabaseClient = undefined;
}

// Custom context to mimic the structure expected by useSupabase
export interface SupabaseContext {
  supabase: SupabaseClient<Database>;
}

export const CustomSupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseClientProvider({ children }: { children: React.ReactNode }) {
  // Provide a fallback value if the client was not successfully created
  const fallbackClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        then: (cb: (result: { data: unknown[]; error: Error }) => void) => cb({ data: [], error: new Error('Supabase client not initialized') }),
      }),
    }),
  } as any as SupabaseClient<Database>;

  console.log('Supabase client initialization status:', supabaseClient ? 'Initialized' : 'Not initialized');
  if (!supabaseClient) {
    console.warn('Supabase client not initialized. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.');
  }
  
  return (
    <CustomSupabaseContext.Provider value={{ supabase: supabaseClient || fallbackClient }}>
      {children}
    </CustomSupabaseContext.Provider>
  );
}
