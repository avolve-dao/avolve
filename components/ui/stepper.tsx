'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@radix-ui/react-icons';

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function Stepper({
  steps,
  activeStep,
  onStepClick,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  className,
  ...props
}: StepperProps) {
  const isVertical = orientation === 'vertical';
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const stepSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    outline: 'border border-primary bg-background text-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-col space-y-4' : 'flex-row space-x-4',
        className
      )}
      {...props}
    >
      {steps.map((label, index) => {
        const isCompleted = index < activeStep;
        const isCurrent = index === activeStep;
        
        return (
          <div
            key={index}
            className={cn(
              'flex',
              isVertical ? 'flex-row items-start' : 'flex-col items-center',
              'gap-2'
            )}
          >
            <div className="flex items-center">
              <button
                type="button"
                className={cn(
                  'flex items-center justify-center rounded-full',
                  stepSizeClasses[size],
                  isCompleted
                    ? variantClasses[variant]
                    : isCurrent
                    ? 'border-2 border-primary bg-background text-primary'
                    : 'border border-muted bg-muted/40 text-muted-foreground',
                  onStepClick ? 'cursor-pointer' : 'cursor-default'
                )}
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span className={sizeClasses[size]}>{index + 1}</span>
                )}
              </button>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    isVertical
                      ? 'ml-3.5 h-full border-l border-muted'
                      : 'mt-3.5 w-full border-t border-muted',
                    'flex-1'
                  )}
                />
              )}
            </div>
            
            <div
              className={cn(
                'flex flex-col',
                sizeClasses[size],
                isCompleted
                  ? 'text-foreground'
                  : isCurrent
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
