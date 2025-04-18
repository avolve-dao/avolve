"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Create context for features
interface FeaturesContextType {
  features: unknown;
  loading: boolean;
}

const FeaturesContext = createContext<FeaturesContextType>({
  features: null,
  loading: true
});

// Hook to use features context
export const useFeatures = () => useContext(FeaturesContext);

// Features provider component
export const FeaturesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadFeatures() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: features } = await supabase
        .from('user_features')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setFeatures(features);
      setLoading(false);
    }

    loadFeatures();
  }, [supabase]);

  if (loading) {
    return null;
  }

  return (
    <FeaturesContext.Provider value={{ features, loading }}>
      {children}
    </FeaturesContext.Provider>
  );
};

export default FeaturesProvider;
