import React, { useContext } from 'react';
import { CustomSupabaseContext as ProviderContext } from '../../components/supabase-client-provider';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';

// Define the type for the Supabase context
export interface UseSupabaseResult {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

export function useSupabase(): UseSupabaseResult {
  const context = useContext(ProviderContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseClientProvider');
  }
  
  // Adapt the context to match UseSupabaseResult
  return {
    supabase: context.supabase,
    session: null, // These values would normally be managed by the provider if needed
    user: null,
    isLoading: false
  };
}
