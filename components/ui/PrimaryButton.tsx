'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showArrow?: boolean;
}

/**
 * Standardized primary button component with consistent styling and loading states
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  className,
  loading = false,
  loadingText,
  disabled,
  icon,
  iconPosition = 'left',
  showArrow = false,
  ...props
}) => {
  const displayText = loading && loadingText ? loadingText : children;
  const isDisabled = disabled || loading;

  return (
    <Button
      className={cn(
        "w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 flex items-center justify-center gap-2",
        isDisabled && "opacity-70 cursor-not-allowed hover:from-indigo-500 hover:to-purple-600",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{displayText}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          <span>{displayText}</span>
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
          {showArrow && <ChevronRight className="ml-2 h-4 w-4" />}
        </>
      )}
    </Button>
  );
};

export default PrimaryButton;
