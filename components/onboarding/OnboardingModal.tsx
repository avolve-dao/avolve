import React, { useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { 
    loading, 
    onboardingStatus, 
    onboardingContent,
    startOnboarding,
    goToNextStep,
    goToPreviousStep
  } = useOnboarding();

  // Start onboarding when modal opens if not already started
  useEffect(() => {
    if (open && (!onboardingStatus || onboardingStatus.step === 0)) {
      startOnboarding();
    }
  }, [open, onboardingStatus]);

  // Calculate progress percentage
  const totalSteps = 5; // Total number of onboarding steps
  const currentStep = onboardingStatus?.step || 1;
  const progress = Math.round((currentStep / totalSteps) * 100);

  // Handle next step
  const handleNext = async () => {
    const result = await goToNextStep();
    if (result.success && 'isCompleted' in result && result.isCompleted) {
      // Close modal when onboarding is completed
      onOpenChange(false);
    }
  };

  // Handle previous step
  const handlePrevious = async () => {
    await goToPreviousStep();
  };

  // Handle skip onboarding
  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {onboardingContent?.title || 'Welcome to Avolve'}
          </DialogTitle>
          <DialogDescription>
            {onboardingContent?.description || 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {onboardingContent?.image && (
          <div className="flex justify-center my-4">
            <div className="relative w-full h-48">
              <Image
                src={onboardingContent.image}
                alt={onboardingContent.title}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Instructions:</h3>
          <ul className="space-y-2">
            {onboardingContent?.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex justify-between mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={loading || currentStep <= 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip Onboarding
            </Button>
          </div>
          <Button 
            onClick={handleNext} 
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
