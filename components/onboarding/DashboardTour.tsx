'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface DashboardTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
  userId: string;
}

/**
 * Guided tour component for first-time users
 * Shows a step-by-step tour of the dashboard features
 */
export const DashboardTour: React.FC<DashboardTourProps> = ({ 
  onComplete, 
  onSkip,
  userId
}) => {
  const [run, setRun] = useState(false);
  const [tourCompleted, setTourCompleted] = useLocalStorage(`tour-completed-${userId}`, false);
  
  // Define tour steps
  const steps: Step[] = [
    {
      target: '.supercivilization-feed',
      content: 'This is your Supercivilization Feed where you can see posts from the community and earn micro-rewards for your contributions.',
      disableBeacon: true,
      placement: 'right',
      title: 'Supercivilization Feed',
    },
    {
      target: '.progress-tracker',
      content: 'Track your personal progress and achievements here. Complete actions to earn tokens and unlock new features.',
      placement: 'bottom',
      title: 'Personal Progress',
    },
    {
      target: '.feature-unlock',
      content: 'As you progress, you\'ll unlock new features and capabilities. Your next feature unlock is highlighted here.',
      placement: 'left',
      title: 'Feature Unlocks',
    },
    {
      target: '.collective-progress',
      content: 'See how the entire Avolve community is progressing toward collective goals. Your contributions help move this forward!',
      placement: 'top',
      title: 'Collective Progress',
    },
    {
      target: '.sidebar-features',
      content: 'Explore all available features here. Some features are locked until you reach certain milestones.',
      placement: 'right',
      title: 'Feature Explorer',
    }
  ];
  
  // Start the tour when the component mounts
  useEffect(() => {
    // Only start the tour if it hasn't been completed before
    if (!tourCompleted) {
      // Small delay to ensure DOM elements are loaded
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [tourCompleted]);
  
  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Mark the tour as completed
      setTourCompleted(true);
      setRun(false);
      
      // Call the appropriate callback
      if (status === STATUS.FINISHED && onComplete) {
        onComplete();
      }
      
      if (status === STATUS.SKIPPED && onSkip) {
        onSkip();
      }
    }
  };
  
  // Don't render anything if the tour has been completed
  if (tourCompleted) {
    return null;
  }
  
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      spotlightClicks
      styles={{
        options: {
          primaryColor: '#6366F1',
          textColor: '#1F2937',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#6366F1',
        },
        buttonBack: {
          color: '#6366F1',
        },
      }}
      locale={{
        last: 'Finish',
        skip: 'Skip tour',
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default DashboardTour;
