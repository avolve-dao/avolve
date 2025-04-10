'use client';

/**
 * Accessibility Provider Component
 * 
 * Provides accessibility features and context for the Avolve platform
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types
interface A11yContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (size: 'normal' | 'large' | 'x-large') => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  screenReaderAnnounce: (message: string) => void;
}

// Create context with default values
const A11yContext = createContext<A11yContextType>({
  highContrast: false,
  toggleHighContrast: () => {},
  fontSize: 'normal',
  setFontSize: () => {},
  reduceMotion: false,
  toggleReduceMotion: () => {},
  screenReaderAnnounce: () => {},
});

// Hook for using the accessibility context
export const useA11y = () => useContext(A11yContext);

interface A11yProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function A11yProvider({ children, userId }: A11yProviderProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const supabase = createClientComponentClient();
  
  // Load user preferences from database if logged in
  useEffect(() => {
    if (userId) {
      const loadPreferences = async () => {
        const { data } = await supabase
          .from('user_accessibility_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (data) {
          setHighContrast(data.high_contrast || false);
          setFontSize(data.font_size || 'normal');
          setReduceMotion(data.reduce_motion || false);
        }
      };
      
      loadPreferences();
    } else {
      // Load from localStorage if not logged in
      const storedHighContrast = localStorage.getItem('a11y-high-contrast');
      const storedFontSize = localStorage.getItem('a11y-font-size');
      const storedReduceMotion = localStorage.getItem('a11y-reduce-motion');
      
      if (storedHighContrast) setHighContrast(storedHighContrast === 'true');
      if (storedFontSize) setFontSize(storedFontSize as 'normal' | 'large' | 'x-large');
      if (storedReduceMotion) setReduceMotion(storedReduceMotion === 'true');
    }
    
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) setReduceMotion(true);
    
  }, [userId, supabase]);
  
  // Save preferences when they change
  useEffect(() => {
    if (userId) {
      const savePreferences = async () => {
        await supabase
          .from('user_accessibility_preferences')
          .upsert({
            user_id: userId,
            high_contrast: highContrast,
            font_size: fontSize,
            reduce_motion: reduceMotion,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      };
      
      savePreferences();
    } else {
      // Save to localStorage if not logged in
      localStorage.setItem('a11y-high-contrast', highContrast.toString());
      localStorage.setItem('a11y-font-size', fontSize);
      localStorage.setItem('a11y-reduce-motion', reduceMotion.toString());
    }
    
    // Apply classes to document root
    const htmlElement = document.documentElement;
    
    if (highContrast) {
      htmlElement.classList.add('high-contrast');
    } else {
      htmlElement.classList.remove('high-contrast');
    }
    
    htmlElement.classList.remove('text-normal', 'text-large', 'text-x-large');
    htmlElement.classList.add(`text-${fontSize}`);
    
    if (reduceMotion) {
      htmlElement.classList.add('reduce-motion');
    } else {
      htmlElement.classList.remove('reduce-motion');
    }
    
  }, [highContrast, fontSize, reduceMotion, userId, supabase]);
  
  // Function to toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };
  
  // Function to toggle reduced motion
  const toggleReduceMotion = () => {
    setReduceMotion(prev => !prev);
  };
  
  // Function to announce messages to screen readers
  const screenReaderAnnounce = (message: string) => {
    setAnnouncement(message);
  };
  
  return (
    <A11yContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        reduceMotion,
        toggleReduceMotion,
        screenReaderAnnounce
      }}
    >
      {children}
      
      {/* Visually hidden announcement for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </A11yContext.Provider>
  );
}
