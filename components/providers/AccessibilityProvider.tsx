import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the accessibility settings interface
interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// Define the context interface
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
};

// Create the context
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * AccessibilityProvider component for managing accessibility settings
 *
 * This provider handles accessibility preferences across the Avolve platform,
 * ensuring a consistent experience for all users regardless of ability.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with default settings
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('avolve-accessibility-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    // Check for prefers-contrast
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    if (prefersContrast) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('avolve-accessibility-settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('avolve-accessibility-settings');
  };

  // Apply settings to the document
  useEffect(() => {
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply large text
    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Apply screen reader optimizations
    if (settings.screenReader) {
      document.documentElement.classList.add('screen-reader-optimized');
    } else {
      document.documentElement.classList.remove('screen-reader-optimized');
    }

    // Apply keyboard navigation
    if (settings.keyboardNavigation) {
      document.documentElement.classList.add('keyboard-navigation');
    } else {
      document.documentElement.classList.remove('keyboard-navigation');
    }
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Custom hook for using the accessibility context
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Accessibility settings component
export function AccessibilitySettings() {
  const { settings, updateSettings, resetSettings } = useAccessibility();

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <h2 className="text-xl font-semibold">Accessibility Settings</h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="high-contrast" className="text-sm font-medium">
            High Contrast
          </label>
          <input
            id="high-contrast"
            type="checkbox"
            checked={settings.highContrast}
            onChange={e => updateSettings({ highContrast: e.target.checked })}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="large-text" className="text-sm font-medium">
            Large Text
          </label>
          <input
            id="large-text"
            type="checkbox"
            checked={settings.largeText}
            onChange={e => updateSettings({ largeText: e.target.checked })}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="reduced-motion" className="text-sm font-medium">
            Reduced Motion
          </label>
          <input
            id="reduced-motion"
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={e => updateSettings({ reducedMotion: e.target.checked })}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="screen-reader" className="text-sm font-medium">
            Screen Reader Optimizations
          </label>
          <input
            id="screen-reader"
            type="checkbox"
            checked={settings.screenReader}
            onChange={e => updateSettings({ screenReader: e.target.checked })}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="keyboard-navigation" className="text-sm font-medium">
            Keyboard Navigation
          </label>
          <input
            id="keyboard-navigation"
            type="checkbox"
            checked={settings.keyboardNavigation}
            onChange={e => updateSettings({ keyboardNavigation: e.target.checked })}
            className="toggle"
          />
        </div>
      </div>

      <button
        onClick={resetSettings}
        className="w-full py-2 px-4 bg-muted hover:bg-muted/80 text-sm font-medium rounded-md"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
