import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  RocketIcon, 
  LayersIcon, 
  TrophyIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CoinsIcon,
  StarIcon
} from 'lucide-react';

type TutorialStep = {
  id: string;
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  tokenSymbol?: string;
  gradientClass: string;
  action?: {
    label: string;
    path: string;
  };
};

type DiscoveryTutorialProps = {
  onComplete?: () => void;
  className?: string;
};

export default function DiscoveryTutorial({
  onComplete,
  className = '',
}: DiscoveryTutorialProps) {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  // user may be undefined, so add appropriate null checks where user is used if not present already
  const { trackActivity } = useTokens();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Define tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'intro',
      title: 'Welcome to Avolve',
      description: 'Avolve is a platform designed to help you transform your life through three main pillars: Superachiever, Superachievers, and Supercivilization.',
      gradientClass: 'from-stone-400 to-stone-600',
      image: '/images/onboarding/welcome.png',
      action: {
        label: 'Start Your Journey',
        path: '/dashboard',
      },
    },
    {
      id: 'superachiever',
      title: 'Superachiever',
      description: 'Create your personal and business success puzzles with joy and ease by becoming a greater superachiever.',
      gradientClass: 'from-stone-400 to-stone-600',
      tokenSymbol: 'SAP',
      image: '/images/onboarding/superachiever.png',
      action: {
        label: 'Explore Superachiever',
        path: '/superachiever',
      },
    },
    {
      id: 'personal-success',
      title: 'Personal Success Puzzle',
      description: 'Achieve greater personal successes in Health & Energy, Wealth & Career, and Peace & People.',
      gradientClass: 'from-amber-400 to-yellow-600',
      tokenSymbol: 'PSP',
      image: '/images/onboarding/personal-success.png',
      action: {
        label: 'Build Your Personal Success',
        path: '/superachiever/personal',
      },
    },
    {
      id: 'business-success',
      title: 'Business Success Puzzle',
      description: 'Achieve greater business successes with Front-Stage Users, Back-Stage Admin, and Bottom-Line Profit.',
      gradientClass: 'from-teal-400 to-cyan-600',
      tokenSymbol: 'BSP',
      image: '/images/onboarding/business-success.png',
      action: {
        label: 'Build Your Business Success',
        path: '/superachiever/business',
      },
    },
    {
      id: 'supermind',
      title: 'Supermind Superpowers',
      description: 'Go further, faster, and forever with superpowers for starting, focusing, and finishing.',
      gradientClass: 'from-violet-400 via-purple-500 to-fuchsia-600',
      tokenSymbol: 'SMS',
      image: '/images/onboarding/supermind.png',
      action: {
        label: 'Develop Your Superpowers',
        path: '/superachiever/supermind',
      },
    },
    {
      id: 'superachievers',
      title: 'Superachievers',
      description: 'Co-create your superpuzzle with other superachievers through collective transformation.',
      gradientClass: 'from-slate-400 to-slate-600',
      tokenSymbol: 'SCQ',
      image: '/images/onboarding/superachievers.png',
      action: {
        label: 'Join Superachievers',
        path: '/superachievers',
      },
    },
    {
      id: 'supercivilization',
      title: 'Supercivilization',
      description: 'Evolve from a degen in an anticivilization into a regen in a supercivilization within your lifetime.',
      gradientClass: 'from-zinc-400 to-zinc-600',
      tokenSymbol: 'GEN',
      image: '/images/onboarding/supercivilization.png',
      action: {
        label: 'Explore Supercivilization',
        path: '/supercivilization',
      },
    },
    {
      id: 'tokens',
      title: 'Token System',
      description: 'Avolve uses a hierarchical token system to gamify your progress and unlock new content as you advance.',
      gradientClass: 'from-blue-400 to-blue-600',
      image: '/images/onboarding/tokens.png',
      action: {
        label: 'View Your Tokens',
        path: '/tokens',
      },
    },
    {
      id: 'completion',
      title: 'Congratulations!',
      description: 'You\'ve completed the discovery tutorial and earned your first achievement. Continue your journey to unlock more content and tokens.',
      gradientClass: 'from-green-400 to-green-600',
      image: '/images/onboarding/completion.png',
      action: {
        label: 'Start Your Journey',
        path: '/dashboard',
      },
    },
  ];
  
  useEffect(() => {
    const fetchUserProgress = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) return;
        
        // Track this view for analytics
        await trackActivity('view_discovery_tutorial', 'tutorial', 'discovery');
        
        // Get completed tutorial steps
        const { data: progress } = await supabase
          .from('user_progress')
          .select('content_id')
          .eq('user_id', user.id)
          .like('content_id', 'tutorial_%');
        
        if (progress) {
          setCompletedSteps(progress.map(p => p.content_id.replace('tutorial_', '')));
        }
      } catch (error) {
        console.error('Error fetching tutorial progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user?.id, supabase, trackActivity]);
  
  const handleStepComplete = async () => {
    try {
      const step = tutorialSteps[currentStep];
      
      // Mark step as completed
      if (!completedSteps.includes(step.id)) {
        // await completeContent(`tutorial_${step.id}`);
        
        // Update local state
        setCompletedSteps([...completedSteps, step.id]);
        
        // Track completion for analytics
        await trackActivity('complete_tutorial_step', 'tutorial_step', step.id);
        
        // If this is the last step, trigger completion callback
        if (currentStep === tutorialSteps.length - 1 && onComplete) {
          onComplete();
        }
      }
      
      // Move to next step if not the last one
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error completing tutorial step:', error);
    }
  };
  
  const handleStepAction = async (step: TutorialStep) => {
    // Track the action for analytics
    await trackActivity('tutorial_action_click', 'tutorial_step', step.id, {
      action_label: step.action?.label,
      action_path: step.action?.path
    });
    
    // Navigate to the action path
    if (step.action?.path) {
      router.push(step.action.path);
    }
  };
  
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const currentTutorialStep = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className={`bg-gradient-to-r ${currentTutorialStep.gradientClass} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {currentStep < 5 ? (
                <BookOpenIcon className="h-5 w-5" />
              ) : currentStep < 7 ? (
                <RocketIcon className="h-5 w-5" />
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
              {currentTutorialStep.title}
            </CardTitle>
            <CardDescription className="text-white/80">
              Step {currentStep + 1} of {tutorialSteps.length}
            </CardDescription>
          </div>
          {currentTutorialStep.tokenSymbol && (
            <Badge className="bg-white/20 text-white border-none">
              <CoinsIcon className="h-3 w-3 mr-1" />
              {currentTutorialStep.tokenSymbol}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Discovery</span>
            <span>Completion</span>
          </div>
        </div>
        
        {/* Tutorial Content */}
        <div className="space-y-6">
          {/* Image or Video */}
          {currentTutorialStep.image && (
            <div className="rounded-lg overflow-hidden border h-64 flex items-center justify-center bg-gray-50">
              <img 
                src={currentTutorialStep.image} 
                alt={currentTutorialStep.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          
          {currentTutorialStep.videoUrl && (
            <div className="rounded-lg overflow-hidden h-64">
              <iframe
                width="100%"
                height="100%"
                src={currentTutorialStep.videoUrl}
                title={currentTutorialStep.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          {/* Description */}
          <div className="text-gray-700">
            <p>{currentTutorialStep.description}</p>
          </div>
          
          {/* Completed Badge */}
          {completedSteps.includes(currentTutorialStep.id) && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Completed
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button 
          variant="outline" 
          onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentTutorialStep.action && (
            <Button 
              variant="outline"
              className={`border-${currentTutorialStep.gradientClass.split('-')[1]}-500 text-${currentTutorialStep.gradientClass.split('-')[1]}-500`}
              onClick={() => handleStepAction(currentTutorialStep)}
            >
              {currentTutorialStep.action.label}
            </Button>
          )}
          
          {currentStep < tutorialSteps.length - 1 ? (
            <Button 
              className={`bg-gradient-to-r ${currentTutorialStep.gradientClass} text-white`}
              onClick={handleStepComplete}
            >
              Continue
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              className={`bg-gradient-to-r ${currentTutorialStep.gradientClass} text-white`}
              onClick={handleStepComplete}
            >
              Complete Tutorial
              <CheckCircleIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
