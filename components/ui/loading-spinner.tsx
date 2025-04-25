import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A simple loading spinner component
 */
export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  return (
    <div className="flex items-center justify-center p-4 min-h-[200px]">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClass}`}
      ></div>
    </div>
  );
}
