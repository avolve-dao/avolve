'use client';

/**
 * Accessibility Controls Component
 *
 * Provides UI controls for adjusting accessibility settings
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { useState } from 'react';
import { useA11y } from './a11y-provider';
import { ZoomIn, ZoomOut, Activity } from 'lucide-react';

// UI components
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function A11yControls() {
  const [open, setOpen] = useState(false);
  const { preferences, updatePreferences } = useA11y();

  // Handle font size change
  const handleFontSizeChange = (size: 'normal' | 'large' | 'x-large') => {
    updatePreferences({ largeText: size !== 'normal' });
    screenReaderAnnounce(`Font size set to ${size}`);
  };

  // Handle high contrast toggle
  const handleContrastToggle = () => {
    updatePreferences({ highContrast: !preferences.highContrast });
    screenReaderAnnounce(
      `High contrast mode ${!preferences.highContrast ? 'enabled' : 'disabled'}`
    );
  };

  // Handle reduce motion toggle
  const handleMotionToggle = () => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion });
    screenReaderAnnounce(`Reduced motion ${!preferences.reducedMotion ? 'enabled' : 'disabled'}`);
  };

  const screenReaderAnnounce = (message: string) => {
    // Placeholder for screen reader announcement
    console.log(message);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          aria-label="Accessibility settings"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-medium text-center" id="a11y-heading">
            Accessibility Settings
          </h3>

          {/* Font Size Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size" className="text-sm font-medium">
                Font Size
              </Label>
              <span className="text-xs text-muted-foreground">
                {preferences.largeText === false
                  ? 'Normal'
                  : preferences.largeText === true
                    ? 'Large'
                    : 'Extra Large'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-1">
                <Button
                  variant={!preferences.largeText ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleFontSizeChange('normal')}
                  aria-pressed={!preferences.largeText}
                >
                  A
                </Button>
                <Button
                  variant={preferences.largeText === true ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleFontSizeChange('large')}
                  aria-pressed={preferences.largeText === true}
                >
                  <span className="text-lg">A</span>
                </Button>
                <Button
                  variant={preferences.largeText === false ? 'outline' : 'default'}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleFontSizeChange('x-large')}
                  aria-pressed={preferences.largeText === false}
                >
                  <span className="text-xl">A</span>
                </Button>
              </div>
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                High Contrast
              </Label>
              <p className="text-xs text-muted-foreground">
                Increase color contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={handleContrastToggle}
              aria-labelledby="high-contrast-label"
            />
          </div>

          {/* Reduce Motion Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion" className="text-sm font-medium">
                Reduce Motion
              </Label>
              <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              id="reduce-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={handleMotionToggle}
              aria-labelledby="reduce-motion-label"
            />
          </div>

          <div className="pt-2 text-xs text-center text-muted-foreground">
            Avolve is committed to WCAG 2.1 AA standards
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
