'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

/**
 * Responsive progress indicator for multi-step flows
 * Shows the current step, completed steps, and overall progress
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  className,
}) => {
  // Calculate progress percentage
  const progressPercentage = (completedSteps.length / steps.length) * 100;
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Progress percentage and step counter */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-sm font-medium text-indigo-600">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      
      {/* Step indicators */}
      <div className="hidden md:flex items-center justify-between w-full mt-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 transition-all duration-200",
                  isCompleted ? "bg-indigo-500 border-indigo-500 text-white" : 
                  isCurrent ? "border-indigo-500 text-indigo-500" : 
                  "border-gray-300 text-gray-400"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium hidden lg:block",
                  isCurrent ? "text-indigo-600" : "text-gray-500"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Mobile step indicator */}
      <div className="flex md:hidden items-center justify-center mt-2">
        <span className="text-sm font-medium text-indigo-600">
          {steps[currentStep]}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
