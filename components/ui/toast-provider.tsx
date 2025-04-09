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
      } else if (streak % 6 === 0) {
        className = "bg-blue-100 border-blue-300 text-blue-900";
        title = "⚡ Tesla 6 Bonus!";
      } else if (streak % 3 === 0) {
        className = "bg-teal-100 border-teal-300 text-teal-900";
        title = "✨ Tesla 3 Bonus!";
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
    },
  };
};

export default ToastProvider;
