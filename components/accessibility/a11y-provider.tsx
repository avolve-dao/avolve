'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

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

  let supabase: SupabaseClient | undefined;
  try {
    supabase = createClient();
  } catch {
    console.warn('Supabase initialization failed. Accessibility features may not work as expected.');
  }

  useEffect(() => {
    async function loadPreferences() {
      if (!supabase) return;
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
    if (!supabase) return;
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
