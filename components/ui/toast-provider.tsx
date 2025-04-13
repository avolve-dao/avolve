"use client";

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

/**
 * ToastProvider Component
 * 
 * Provides a consistent toast notification system for the application
 * with predefined styles based on sacred geometry principles
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

/**
 * useAvolveToast Hook
 * 
 * A custom hook that provides standardized toast notifications for the Avolve platform
 */
export const useAvolveToast = () => {
  const { toast } = useToast();
  
  return {
    /**
     * Show a success toast notification
     */
    success: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
      toast({
        title,
        description,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
        action: action ? (
          <ToastAction altText={action.label} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        ) : undefined,
      });
    },
    
    /**
     * Show an error toast notification
     */
    error: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
      toast({
        title,
        description,
        variant: "destructive",
        action: action ? (
          <ToastAction altText={action.label} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        ) : undefined,
      });
    },
    
    /**
     * Show a warning toast notification
     */
    warning: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
      toast({
        title,
        description,
        variant: "default",
        className: "bg-amber-50 border-amber-200 text-amber-800",
        action: action ? (
          <ToastAction altText={action.label} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        ) : undefined,
      });
    },
    
    /**
     * Show an info toast notification
     */
    info: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
      toast({
        title,
        description,
        variant: "default",
        className: "bg-blue-50 border-blue-200 text-blue-800",
        action: action ? (
          <ToastAction altText={action.label} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        ) : undefined,
      });
    },
    
    /**
     * Show a streak bonus toast notification with Tesla 3-6-9 pattern styling
     */
    streakBonus: (streak: number, tokenSymbol: string, amount: number) => {
      let className = "bg-indigo-50 border-indigo-200 text-indigo-800";
      let title = "Streak Bonus!";
      
      // Apply Tesla's 3-6-9 pattern
      if (streak % 9 === 0) {
        className = "bg-purple-100 border-purple-300 text-purple-900";
        title = "🔮 Tesla 9 Bonus!";
        
        // Trigger confetti animation for milestone
        if (typeof window !== 'undefined') {
          import('canvas-confetti').then(confetti => {
            confetti.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#9333ea', '#6366f1', '#8b5cf6'],
              gravity: 0.8,
              scalar: 1.2
            });
          });
        }
      } else if (streak % 6 === 0) {
        className = "bg-blue-100 border-blue-300 text-blue-900";
        title = "⚡ Tesla 6 Bonus!";
        
        // Smaller confetti for 6-day milestone
        if (typeof window !== 'undefined') {
          import('canvas-confetti').then(confetti => {
            confetti.default({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
              gravity: 0.7
            });
          });
        }
      } else if (streak % 3 === 0) {
        className = "bg-teal-100 border-teal-300 text-teal-900";
        title = "✨ Tesla 3 Bonus!";
        
        // Small sparkle effect for 3-day milestone
        if (typeof window !== 'undefined') {
          import('canvas-confetti').then(confetti => {
            confetti.default({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.6 },
              colors: ['#14b8a6', '#2dd4bf', '#5eead4'],
              gravity: 0.6
            });
          });
        }
      }
      
      toast({
        title,
        description: `${streak}-day streak! You earned ${amount} ${tokenSymbol} tokens.`,
        variant: "default",
        className,
        duration: 5000,
      });
    },
    
    /**
     * Show a token unlock toast notification
     */
    tokenUnlock: (tokenSymbol: string) => {
      toast({
        title: "🎉 Token Unlocked!",
        description: `You've unlocked ${tokenSymbol} tokens. New features are now available!`,
        variant: "default",
        className: "bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200 text-indigo-900",
        duration: 8000,
        action: (
          <ToastAction altText="View Tokens" onClick={() => window.location.href = "/tokens"}>
            View Tokens
          </ToastAction>
        ),
      });
      
      // Celebration animation for token unlock
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(confetti => {
          // Fire multiple bursts for a more impressive effect
          const count = 3;
          const defaults = {
            origin: { y: 0.7 },
            zIndex: 1500 // Ensure it's above other UI elements
          };
          
          function fire(particleRatio: number, opts: any) {
            confetti.default({
              ...defaults,
              particleCount: Math.floor(200 * particleRatio),
              spread: 60,
              ...opts,
            });
          }
          
          fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#9333ea', '#6366f1']
          });
          fire(0.2, {
            spread: 60,
            colors: ['#14b8a6', '#0ea5e9']
          });
          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: ['#f59e0b', '#ef4444']
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            colors: ['#22c55e', '#84cc16']
          });
        });
      }
    },
    
    /**
     * Show a progress toast for long-running operations
     */
    progress: (title: string, description: string, promise: Promise<any>, options?: {
      loading?: string;
      success?: string;
      error?: string;
      action?: { label: string; onClick: () => void };
    }) => {
      // Show initial loading toast
      toast({
        title,
        description: options?.loading || description,
        variant: "default",
        className: "bg-blue-50 border-blue-200 text-blue-800",
        duration: Infinity, // Don't auto-dismiss during loading
        action: (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            <span>Loading...</span>
          </div>
        ),
      });
      
      promise
        .then((result) => {
          // Show success toast when completed
          toast({
            title: title,
            description: options?.success || "Operation completed successfully",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
            duration: 5000,
            action: options?.action ? (
              <ToastAction altText={options.action.label} onClick={options.action.onClick}>
                {options.action.label}
              </ToastAction>
            ) : undefined,
          });
          
          return result;
        })
        .catch((error) => {
          // Show error toast if failed
          toast({
            title: "Error",
            description: options?.error || error.message || "An error occurred",
            variant: "destructive",
            duration: 5000,
          });
          throw error;
        });
      
      return promise;
    },
  };
};

export default ToastProvider;
