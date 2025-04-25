import { useContext, useState, useEffect } from 'react';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { SupabaseContext, SupabaseContextType } from '@/components/supabase/provider';

// Re-export the context type and Context for use in hooks
export type { SupabaseContextType };

// Define the type for the Supabase context
export interface UseSupabaseResult {
  supabase: SupabaseClient<any>;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

export function useSupabase(): UseSupabaseResult {
  const context = useContext(SupabaseContext) as SupabaseContextType | undefined;
  if (!context) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  const { supabase } = context;

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    supabase,
    session,
    user,
    isLoading,
  };
}

// Type guard to check if user exists
export function hasUser(hook: UseSupabaseResult): hook is UseSupabaseResult & { user: User } {
  return hook.user !== null && hook.user !== undefined;
}

// Type assertion method
export function assertUser(
  hook: UseSupabaseResult
): asserts hook is UseSupabaseResult & { user: User } {
  if (!hook.user) {
    throw new Error('User is not available');
  }
}
