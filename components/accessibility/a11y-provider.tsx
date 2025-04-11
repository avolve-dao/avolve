'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface A11yPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

const A11yContext = createContext<{
  preferences: A11yPreferences;
  updatePreferences: (newPrefs: Partial<A11yPreferences>) => Promise<void>;
}>({
  preferences: {
    highContrast: false,
    largeText: false,
    reducedMotion: false
  },
  updatePreferences: async () => {}
});

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<A11yPreferences>({
    highContrast: false,
    largeText: false,
    reducedMotion: false
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadPreferences() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from('user_preferences')
        .select('accessibility')
        .eq('user_id', user.id)
        .single();

      if (data?.accessibility) {
        setPreferences(data.accessibility);
      }
    }

    loadPreferences();
  }, [supabase]);

  const updatePreferences = async (newPrefs: Partial<A11yPreferences>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        accessibility: updatedPrefs
      });
  };

  return (
    <A11yContext.Provider value={{ preferences, updatePreferences }}>
      <div
        className={`
          ${preferences.highContrast ? 'high-contrast' : ''}
          ${preferences.largeText ? 'large-text' : ''}
          ${preferences.reducedMotion ? 'reduced-motion' : ''}
        `}
      >
        {children}
      </div>
    </A11yContext.Provider>
  );
}

export const useA11y = () => useContext(A11yContext);
