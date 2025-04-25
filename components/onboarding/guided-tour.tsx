'use client';

import { useState, useEffect } from 'react';
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
import { createClient } from '../../lib/supabase/client';
import { X } from 'lucide-react';

// Define the tour steps based on experience phases
const tourSteps = [
  {
    title: 'Welcome to Avolve!',
    description:
      'This guided tour will help you understand the key features of the platform. You can exit anytime and resume later.',
    phase: 'discovery',
    image: '/onboarding/welcome.png',
  },
  {
    title: 'Your Dashboard',
    description:
      'This is your personal dashboard where you can track your progress, see upcoming events, and access all features.',
    phase: 'discovery',
    image: '/onboarding/dashboard.png',
  },
  {
    title: 'Tokens & Achievements',
    description:
      'Earn tokens by completing activities and unlocking achievements. Tokens give you access to advanced features.',
    phase: 'onboarding',
    image: '/onboarding/tokens.png',
  },
  {
    title: 'Journey Map',
    description:
      'Follow your personalized journey to unlock new features and capabilities as you progress.',
    phase: 'onboarding',
    image: '/onboarding/journey.png',
  },
  {
    title: 'Community & Teams',
    description:
      'Collaborate with other members through teams and community puzzles to accelerate your progress.',
    phase: 'scaffolding',
    image: '/onboarding/community.png',
  },
  {
    title: 'Superpuzzles',
    description:
      'Contribute to community superpuzzles to earn SCQ tokens and boost your Community Health metrics.',
    phase: 'endgame',
    image: '/onboarding/superpuzzles.png',
  },
];

interface GuidedTourProps {
  userId: string;
  onComplete?: () => void;
}

export function GuidedTour({ userId, onComplete }: GuidedTourProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userPhase, setUserPhase] = useState<string>('discovery');
  const supabase = createClient();

  // Calculate progress percentage
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Fetch user's current experience phase
  useEffect(() => {
    async function fetchUserPhase() {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('experience_phase')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setUserPhase(data.experience_phase || 'discovery');
      }
    }

    // Check if the user has completed the tour
    async function checkTourStatus() {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed_tour')
        .eq('user_id', userId)
        .single();

      if (!data || error || !data.completed_tour) {
        setOpen(true);
      }
    }

    fetchUserPhase();
    checkTourStatus();
  }, [userId, supabase]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle tour completion
  const handleComplete = async () => {
    // Save tour completion status
    await supabase.from('user_onboarding').upsert({
      user_id: userId,
      completed_tour: true,
      completed_at: new Date().toISOString(),
    });

    setOpen(false);
    if (onComplete) onComplete();
  };

  // Filter steps based on user's experience phase
  const phaseOrder = ['discovery', 'onboarding', 'scaffolding', 'endgame'];
  const visibleSteps = tourSteps.filter(
    step => phaseOrder.indexOf(step.phase) <= phaseOrder.indexOf(userPhase)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{visibleSteps[currentStep]?.title}</DialogTitle>
          <DialogDescription>{visibleSteps[currentStep]?.description}</DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="my-6">
          {visibleSteps[currentStep]?.image && (
            <div className="relative rounded-md overflow-hidden aspect-video mb-4">
              <img
                src={visibleSteps[currentStep].image}
                alt={visibleSteps[currentStep].title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep + 1} of {visibleSteps.length}
          </p>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Skip for now
            </Button>
            <Button onClick={handleNext}>
              {currentStep < visibleSteps.length - 1 ? 'Next' : 'Complete'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
