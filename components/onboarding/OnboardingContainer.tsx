'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ProgressIndicator } from './ProgressIndicator';
import { StepInstructions } from './StepInstructions';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface OnboardingContainerProps {
  children: ReactNode;
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepNames: string[];
  onNext: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  illustration?: string;
}

/**
 * Responsive container for onboarding steps
 * Provides consistent layout, navigation, and feedback for all onboarding steps
 */
export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  title,
  description,
  currentStep,
  totalSteps,
  completedSteps,
  stepNames,
  onNext,
  onBack,
  isNextDisabled = false,
  isLoading = false,
  loadingText = 'Processing...',
  className,
  illustration,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Avolve
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the Supercivilization
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className={cn(
          "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10",
          className
        )}>
          {/* Progress indicator */}
          <ProgressIndicator 
            steps={stepNames}
            currentStep={currentStep}
            completedSteps={completedSteps}
            className="mb-8"
          />
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Main content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
              
              <StepInstructions 
                title="What you'll do in this step"
                description={description}
                type="info"
                className="mb-6"
              />
              
              {/* Step content */}
              <div className="space-y-6">
                {children}
              </div>
            </div>
            
            {/* Illustration (hidden on mobile) */}
            {illustration && (
              <div className="hidden md:block flex-shrink-0 w-1/3 mt-6 md:mt-0">
                <Image
                  src={illustration}
                  alt="Step illustration"
                  width={200}
                  height={200}
                  className="w-full h-auto"
                  priority={true}
                />
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8">
            {currentStep > 0 && onBack ? (
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <div></div> /* Empty div to maintain flex layout */
            )}
            
            <PrimaryButton
              onClick={onNext}
              disabled={isNextDisabled}
              loading={isLoading}
              loadingText={loadingText}
              showArrow={true}
            >
              {isLastStep ? 'Complete' : 'Continue'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingContainer;
