'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Custom check icon component to replace the dependency
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

// Add missing exports for the stepper components
export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'complete' | 'current' | 'upcoming';
  children?: React.ReactNode;
}

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'complete' | 'current' | 'upcoming';
  children?: React.ReactNode;
}

export interface StepStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'complete' | 'current' | 'upcoming';
  children?: React.ReactNode;
}

export interface StepTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

export interface StepDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export interface StepSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

// Export the individual components
export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, status = 'upcoming', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1', className)}
      data-status={status}
      {...props}
    />
  )
);
Step.displayName = 'Step';

export const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ className, status = 'upcoming', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full',
        status === 'complete'
          ? 'bg-primary text-primary-foreground'
          : status === 'current'
            ? 'border-2 border-primary bg-background text-primary'
            : 'border border-muted bg-muted/40 text-muted-foreground',
        className
      )}
      {...props}
    >
      {status === 'complete' ? <CheckIcon className="h-4 w-4" /> : children}
    </div>
  )
);
StepIndicator.displayName = 'StepIndicator';

export const StepStatus = React.forwardRef<HTMLDivElement, StepStatusProps>(
  ({ className, status = 'upcoming', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2',
        status === 'complete'
          ? 'text-foreground'
          : status === 'current'
            ? 'font-medium text-foreground'
            : 'text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
StepStatus.displayName = 'StepStatus';

export const StepTitle = React.forwardRef<HTMLHeadingElement, StepTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-sm font-medium', className)} {...props} />
  )
);
StepTitle.displayName = 'StepTitle';

export const StepDescription = React.forwardRef<HTMLParagraphElement, StepDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-muted-foreground', className)} {...props} />
  )
);
StepDescription.displayName = 'StepDescription';

export const StepSeparator = React.forwardRef<HTMLDivElement, StepSeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        orientation === 'horizontal'
          ? 'w-full border-t border-muted'
          : 'h-full border-l border-muted',
        className
      )}
      {...props}
    />
  )
);
StepSeparator.displayName = 'StepSeparator';

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
      className={cn('flex', isVertical ? 'flex-col space-y-4' : 'flex-row space-x-4', className)}
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
