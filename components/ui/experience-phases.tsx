'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';

// Define experience phase color system
export const phaseColors = {
  discovery: {
    primary: '#3b82f6', // blue-500
    secondary: '#1d4ed8', // blue-700
    background: 'rgba(59, 130, 246, 0.1)', // blue-500 with 10% opacity
    border: 'rgba(59, 130, 246, 0.3)', // blue-500 with 30% opacity
    text: '#93c5fd', // blue-300
    icon: '/phases/discovery.svg'
  },
  onboarding: {
    primary: '#8b5cf6', // violet-500
    secondary: '#6d28d9', // violet-700
    background: 'rgba(139, 92, 246, 0.1)', // violet-500 with 10% opacity
    border: 'rgba(139, 92, 246, 0.3)', // violet-500 with 30% opacity
    text: '#c4b5fd', // violet-300
    icon: '/phases/onboarding.svg'
  },
  scaffolding: {
    primary: '#10b981', // emerald-500
    secondary: '#047857', // emerald-700
    background: 'rgba(16, 185, 129, 0.1)', // emerald-500 with 10% opacity
    border: 'rgba(16, 185, 129, 0.3)', // emerald-500 with 30% opacity
    text: '#6ee7b7', // emerald-300
    icon: '/phases/scaffolding.svg'
  },
  endgame: {
    primary: '#f59e0b', // amber-500
    secondary: '#b45309', // amber-700
    background: 'rgba(245, 158, 11, 0.1)', // amber-500 with 10% opacity
    border: 'rgba(245, 158, 11, 0.3)', // amber-500 with 30% opacity
    text: '#fcd34d', // amber-300
    icon: '/phases/endgame.svg'
  }
};

// Phase badge component with consistent styling
interface PhaseBadgeProps {
  phase: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  userId?: string;
  showTooltip?: boolean;
}

export function PhaseBadge({ 
  phase, 
  showIcon = true, 
  size = 'md',
  className = '',
  userId,
  showTooltip = false
}: PhaseBadgeProps) {
  const phaseKey = phase.toLowerCase() as keyof typeof phaseColors;
  const phaseColor = phaseColors[phaseKey] || phaseColors.discovery;
  
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const formattedPhase = phase.charAt(0).toUpperCase() + phase.slice(1);
  
  const badge = (
    <Badge
      className={`inline-flex items-center font-medium ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: phaseColor.background,
        borderColor: phaseColor.border,
        color: phaseColor.primary,
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {showIcon && (
        <img 
          src={phaseColor.icon} 
          alt={phase} 
          className={`${iconSizes[size]} mr-1`}
        />
      )}
      {formattedPhase} Phase
    </Badge>
  );
  
  if (showTooltip && userId) {
    return (
      <ContextualTooltip type="experience_phases" userId={userId}>
        {badge}
      </ContextualTooltip>
    );
  }
  
  return badge;
}

// Phase card component
interface PhaseCardProps {
  phase: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function PhaseCard({ 
  phase, 
  title, 
  description, 
  children,
  className = '',
  active = false
}: PhaseCardProps) {
  const phaseKey = phase.toLowerCase() as keyof typeof phaseColors;
  const phaseColor = phaseColors[phaseKey] || phaseColors.discovery;
  const formattedPhase = phase.charAt(0).toUpperCase() + phase.slice(1);
  
  return (
    <div 
      className={`rounded-lg border p-4 ${active ? 'ring-2' : ''} ${className}`}
      style={{ 
        borderColor: phaseColor.border,
        backgroundColor: phaseColor.background,
        ...(active ? { ringColor: phaseColor.primary } : {})
      }}
    >
      <div className="flex items-start mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: `${phaseColor.primary}30` }}
        >
          <img 
            src={phaseColor.icon} 
            alt={phase} 
            className="w-6 h-6"
          />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: phaseColor.primary }}>
            {title || `${formattedPhase} Phase`}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// Phase progress component
interface PhaseProgressProps {
  currentPhase: string;
  className?: string;
}

export function PhaseProgress({ 
  currentPhase,
  className = ''
}: PhaseProgressProps) {
  const phases = ['discovery', 'onboarding', 'scaffolding', 'endgame'];
  const currentIndex = phases.indexOf(currentPhase.toLowerCase());
  
  return (
    <div className={`flex items-center ${className}`}>
      {phases.map((phase, index) => {
        const phaseColor = phaseColors[phase as keyof typeof phaseColors];
        const isActive = index <= currentIndex;
        const isLast = index === phases.length - 1;
        
        return (
          <React.Fragment key={phase}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-opacity-100' : 'bg-opacity-30'
                }`}
                style={{ 
                  backgroundColor: isActive ? phaseColor.primary : '#374151',
                }}
              >
                {isActive && (
                  <img 
                    src={phaseColor.icon} 
                    alt={phase} 
                    className="w-3 h-3"
                  />
                )}
              </div>
              <span 
                className="text-xs mt-1"
                style={{ 
                  color: isActive ? phaseColor.primary : '#6b7280',
                  fontWeight: isActive ? 500 : 400
                }}
              >
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </span>
            </div>
            
            {!isLast && (
              <div 
                className="h-0.5 flex-1 mx-1"
                style={{ 
                  backgroundColor: index < currentIndex ? phaseColor.primary : '#374151',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
