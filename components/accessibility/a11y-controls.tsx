'use client';

/**
 * Accessibility Controls Component
 * 
 * Provides UI controls for adjusting accessibility settings
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState } from 'react';
import { useA11y } from './a11y-provider';
import { 
  Sun, 
  Moon, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Zap, 
  Activity,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// UI components
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function A11yControls() {
  const [open, setOpen] = useState(false);
  const { 
    highContrast, 
    toggleHighContrast, 
    fontSize, 
    setFontSize,
    reduceMotion,
    toggleReduceMotion,
    screenReaderAnnounce
  } = useA11y();
  
  // Handle font size change
  const handleFontSizeChange = (size: 'normal' | 'large' | 'x-large') => {
    setFontSize(size);
    screenReaderAnnounce(`Font size set to ${size}`);
  };
  
  // Handle high contrast toggle
  const handleContrastToggle = () => {
    toggleHighContrast();
    screenReaderAnnounce(`High contrast mode ${!highContrast ? 'enabled' : 'disabled'}`);
  };
  
  // Handle reduce motion toggle
  const handleMotionToggle = () => {
    toggleReduceMotion();
    screenReaderAnnounce(`Reduced motion ${!reduceMotion ? 'enabled' : 'disabled'}`);
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
          <h3 className="font-medium text-center" id="a11y-heading">Accessibility Settings</h3>
          
          {/* Font Size Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size" className="text-sm font-medium">
                Font Size
              </Label>
              <span className="text-xs text-muted-foreground">
                {fontSize === 'normal' ? 'Normal' : 
                 fontSize === 'large' ? 'Large' : 'Extra Large'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-1">
                <Button 
                  variant={fontSize === 'normal' ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleFontSizeChange('normal')}
                  aria-pressed={fontSize === 'normal'}
                >
                  A
                </Button>
                <Button 
                  variant={fontSize === 'large' ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleFontSizeChange('large')}
                  aria-pressed={fontSize === 'large'}
                >
                  <span className="text-lg">A</span>
                </Button>
                <Button 
                  variant={fontSize === 'x-large' ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleFontSizeChange('x-large')}
                  aria-pressed={fontSize === 'x-large'}
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
              <Label 
                htmlFor="high-contrast" 
                className="text-sm font-medium"
              >
                High Contrast
              </Label>
              <p className="text-xs text-muted-foreground">
                Increase color contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={handleContrastToggle}
              aria-labelledby="high-contrast-label"
            />
          </div>
          
          {/* Reduce Motion Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label 
                htmlFor="reduce-motion" 
                className="text-sm font-medium"
              >
                Reduce Motion
              </Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
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
