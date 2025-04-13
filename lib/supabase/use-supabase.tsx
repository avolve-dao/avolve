import React, { useContext, useState, useEffect } from 'react';
import { CustomSupabaseContext as ProviderContext } from '../../components/supabase-client-provider';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';

// Define the type for the Supabase context
export interface UseSupabaseResult {
  supabase: SupabaseClient;
  session?: Session | null;
  user?: User | null;
  isLoading: boolean;
  data: {
    supabase: SupabaseClient;
    session?: Session | null;
    user?: User | null;
    isLoading: boolean;
  };
}

export function useSupabase(): UseSupabaseResult {
  const context = useContext(ProviderContext);
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!context) {
      setIsLoading(false);
      return;
    }
    
    const fetchSession = async () => {
      try {
        const { data: { session } } = await context.supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          const { data: { user } } = await context.supabase.auth.getUser();
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSession();
    
    const { data: { subscription } } = context.supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [context]);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseClientProvider');
  }
  
  return {
    supabase: context.supabase,
    session,
    user,
    isLoading,
    data: {
      supabase: context.supabase,
      session,
      user,
      isLoading
    }
  };
}

// Type guard to check if user exists
export function hasUser(hook: UseSupabaseResult): hook is UseSupabaseResult & { user: User } {
  return hook.user !== null && hook.user !== undefined;
}

// Type assertion method
export function assertUser(hook: UseSupabaseResult): asserts hook is UseSupabaseResult & { user: User } {
  if (!hook.user) {
    throw new Error('User is not available');
  }
}
