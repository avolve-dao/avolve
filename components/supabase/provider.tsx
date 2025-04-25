'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../../lib/supabase/client';
import { SupabaseClient, Session } from '@supabase/supabase-js';

export type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export { SupabaseContext };

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    };

    getSession();
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
