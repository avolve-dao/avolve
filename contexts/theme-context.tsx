'use client';

import * as React from 'react';

import { createContext, useContext, useState, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: string | null;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  theme: null,
  setTheme: () => {},
});

export const useMessagingTheme = () => useContext(ThemeContext);

export function MessagingThemeProvider({ children }: { children: React.ReactNode }) {
  // Use the app's theme system
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(nextTheme === 'dark');
  }, [nextTheme]);

  const toggleTheme = () => {
    setNextTheme(isDark ? 'light' : 'dark');
  };

  const setTheme = (theme: string) => {
    setNextTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: nextTheme ?? null, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
