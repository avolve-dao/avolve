'use client';

import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  message: string;
  details?: string;
  severity?: ErrorSeverity;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Standardized error display component
 * Provides consistent styling and behavior for error messages
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  details,
  severity = 'error',
  className,
  onDismiss,
}) => {
  // Determine colors and icon based on severity
  const getSeverityStyles = () => {
    switch (severity) {
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          textColor: 'text-amber-800',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          textColor: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-500" />,
        };
      case 'error':
      default:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          textColor: 'text-red-800',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        };
    }
  };
  
  const { bgColor, borderColor, textColor, icon } = getSeverityStyles();
  
  return (
    <div 
      className={cn(
        "rounded-md p-4 border",
        bgColor,
        borderColor,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={cn("text-sm font-medium", textColor)}>
            {message}
          </h3>
          {details && (
            <div className={cn("mt-2 text-sm", textColor, "opacity-80")}>
              <p>{details}</p>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  "inline-flex rounded-md p-1.5",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  severity === 'error' ? "text-red-500 hover:bg-red-100 focus:ring-red-500" :
                  severity === 'warning' ? "text-amber-500 hover:bg-amber-100 focus:ring-amber-500" :
                  "text-blue-500 hover:bg-blue-100 focus:ring-blue-500"
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
