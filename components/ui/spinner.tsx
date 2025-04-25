'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

/**
 * Spinner Component
 *
 * A customizable loading spinner with different sizes and variants.
 *
 * @example
 * ```tsx
 * // Default spinner
 * <Spinner />
 *
 * // Large primary spinner
 * <Spinner size="lg" variant="primary" />
 *
 * // Small accent spinner with custom class
 * <Spinner size="sm" variant="accent" className="my-4" />
 * ```
 */
export function Spinner({ size = 'md', variant = 'default', className, ...props }: SpinnerProps) {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  // Variant classes
  const variantClasses = {
    default: 'border-muted-foreground/20 border-t-muted-foreground/60',
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    accent: 'border-accent/20 border-t-accent',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
