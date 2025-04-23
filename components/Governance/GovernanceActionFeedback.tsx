'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackProps {
  message: string;
  type: FeedbackType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  onDismiss?: () => void;
}

// Custom toast content for governance actions (preserves Avolve styling)
const getGradient = (type: FeedbackType) => {
  switch (type) {
    case 'success': return 'from-lime-500 via-green-500 to-emerald-500';
    case 'error': return 'from-rose-500 via-red-500 to-orange-500';
    case 'warning': return 'from-amber-500 to-yellow-500';
    case 'info': return 'from-sky-500 via-blue-500 to-indigo-500';
    default: return 'from-violet-500 via-purple-500 to-fuchsia-500';
  }
};

const getIcon = (type: FeedbackType) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
};

function showFeedback(
  type: FeedbackType,
  message: string,
  duration: number = 4000
) {
  const { toast } = useToast();
  toast({
    title: message,
    description: (
      <div className={`flex items-center gap-x-2 bg-gradient-to-r ${getGradient(type)} text-white rounded-md px-2 py-1`}>
        {getIcon(type)}
        <span>{message}</span>
      </div>
    ),
    variant: type === 'error' ? 'destructive' : 'default',
    duration,
  });
}

// Main component to include in layout
export const GovernanceActionFeedback: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check for feedback in URL parameters when component mounts
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('feedback') as FeedbackType | null;
    const message = urlParams.get('message');
    
    if (type && message) {
      showFeedback(type, decodeURIComponent(message));
      
      // Remove the feedback parameters from the URL
      urlParams.delete('feedback');
      urlParams.delete('message');
      
      const newUrl = window.location.pathname + 
        (urlParams.toString() ? `?${urlParams.toString()}` : '');
      
      // Update URL without the feedback parameters
      window.history.replaceState({}, '', newUrl);
    }
  }, [router, toast]);

  // No need for <Toaster />; your toast system handles display globally
  return null;
};

// Hook for governance action feedback
export const useGovernanceFeedback = () => {
  return {
    showSuccess: (message: string, duration?: number) => showFeedback('success', message, duration),
    showError: (message: string, duration?: number) => showFeedback('error', message, duration),
    showWarning: (message: string, duration?: number) => showFeedback('warning', message, duration),
    showInfo: (message: string, duration?: number) => showFeedback('info', message, duration),
  };
};

export default GovernanceActionFeedback;
