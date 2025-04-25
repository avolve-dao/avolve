'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface StepInstructionsProps {
  title: string;
  description: string;
  type?: 'info' | 'warning' | 'success';
  className?: string;
}

/**
 * Component to display clear instructions and feedback during onboarding
 */
export const StepInstructions: React.FC<StepInstructionsProps> = ({
  title,
  description,
  type = 'info',
  className,
}) => {
  // Determine colors and icon based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          textColor: 'text-amber-800',
          descriptionColor: 'text-amber-700',
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
          textColor: 'text-green-800',
          descriptionColor: 'text-green-700',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-100',
          textColor: 'text-indigo-800',
          descriptionColor: 'text-indigo-700',
          icon: <Info className="h-5 w-5 text-indigo-500" />,
        };
    }
  };
  
  const { bgColor, borderColor, textColor, descriptionColor, icon } = getTypeStyles();
  
  return (
    <div 
      className={cn(
        bgColor,
        borderColor,
        "border rounded-lg p-4 mb-6",
        className
      )}
      role="region"
      aria-label={`${type} instructions`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="ml-3">
          <h3 className={cn("font-medium mb-1", textColor)}>
            {title}
          </h3>
          <p className={cn("text-sm", descriptionColor)}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepInstructions;
