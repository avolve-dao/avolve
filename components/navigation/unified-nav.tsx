'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, Users, Globe, Brain, Briefcase, 
  Heart, Award, Zap, ChevronRight, Lock,
  Sparkles, Compass, Map, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';
import { useSupabase } from '@/components/supabase/provider';
import { 
  useUserProgress, 
  type ExperiencePhase, 
  type PillarType, 
  type UserProgressData 
} from '@/hooks/use-user-progress';
import { useTokens, type Token } from '@/hooks/use-tokens';

// Define types for experience phases and pillars
type ExperiencePhase = 'discover' | 'onboard' | 'scaffold' | 'endgame';
type PillarType = 'superachiever' | 'superachievers' | 'supercivilization';

// Gradient styles for each pillar
const pillarGradients: Record<PillarType, string> = {
  superachiever: 'bg-gradient-to-r from-stone-500 to-stone-700',
  superachievers: 'bg-gradient-to-r from-slate-500 to-slate-700',
  supercivilization: 'bg-gradient-to-r from-zinc-500 to-zinc-700'
};

// Phase-specific styling
const phaseStyles: Record<ExperiencePhase, string> = {
  discover: 'border-l-amber-500',
  onboard: 'border-l-emerald-500',
  scaffold: 'border-l-blue-500',
  endgame: 'border-l-purple-500'
};

// Phase icons
const PhaseIcon = ({ phase }: { phase: ExperiencePhase }) => {
  switch (phase) {
    case 'discover':
      return <Compass className="h-4 w-4" />;
    case 'onboard':
      return <Map className="h-4 w-4" />;
    case 'scaffold':
      return <Zap className="h-4 w-4" />;
    case 'endgame':
      return <Flag className="h-4 w-4" />;
    default:
      return null;
  }
};

export function UnifiedNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase, session } = useSupabase();
  const { userProgress } = useUserProgress();
  const { tokens } = useTokens();
  const [activePillar, setActivePillar] = useState<PillarType | null>(null);
  
  // Determine active pillar based on current path
  useEffect(() => {
    if (pathname?.includes('superachiever')) {
      setActivePillar('superachiever');
    } else if (pathname?.includes('superachievers')) {
      setActivePillar('superachievers');
    } else if (pathname?.includes('supercivilization')) {
      setActivePillar('supercivilization');
    } else {
      setActivePillar(null);
    }
  }, [pathname]);

  // Check if a route is accessible based on tokens
  const canAccess = (pillar: PillarType, phase: ExperiencePhase): boolean => {
    if (!userProgress || !tokens) return false;
    
    // Map pillars to their required tokens
    const pillarTokenMap: Record<PillarType, string> = {
      superachiever: 'SAP',
      superachievers: 'SCQ',
      supercivilization: 'GEN'
    };
    
    // Check if user has the required token for the pillar
    const hasRequiredToken = tokens.some((token: Token) => 
      token.symbol === pillarTokenMap[pillar] && token.balance > 0
    );
    
    // Check if user has reached the required phase in this pillar
    const hasReachedPhase = userProgress[pillar] && 
      ['discover', 'onboard', 'scaffold', 'endgame'].indexOf(userProgress[pillar].current_phase) >= 
      ['discover', 'onboard', 'scaffold', 'endgame'].indexOf(phase);
    
    return hasRequiredToken && hasReachedPhase;
  };

  // Get the highest phase the user has reached for a pillar
  const getCurrentPhase = (pillar: PillarType): ExperiencePhase => {
    return userProgress?.[pillar]?.current_phase || 'discover';
  };

  // Get the next recommended phase for a pillar
  const getNextRecommendedPhase = (pillar: PillarType): ExperiencePhase => {
    const current = getCurrentPhase(pillar);
    const phaseOrder: ExperiencePhase[] = ['discover', 'onboard', 'scaffold', 'endgame'];
    const currentIndex = phaseOrder.indexOf(current);
    
    if (currentIndex < phaseOrder.length - 1) {
      return phaseOrder[currentIndex + 1];
    }
    return current;
  };

  // Generate the URL for a pillar and phase
  const getPillarPhaseUrl = (pillar: PillarType, phase: ExperiencePhase): string => {
    return `/${pillar}/${phase}`;
  };

  // Render a pillar navigation item with its phases
  const renderPillarNav = (pillar: PillarType, icon: React.ReactNode, label: string) => {
    const currentPhase = getCurrentPhase(pillar);
    const nextPhase = getNextRecommendedPhase(pillar);
    const isActive = activePillar === pillar;
    
    return (
      <div className="mb-4">
        <div 
          className={cn(
            "flex items-center p-2 rounded-lg cursor-pointer transition-all",
            isActive ? pillarGradients[pillar] : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          onClick={() => router.push(getPillarPhaseUrl(pillar, currentPhase))}
        >
          <div className="mr-2 text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 p-2 rounded-md">
            {icon}
          </div>
          <span className="flex-1 font-medium">{label}</span>
          {isActive && <ChevronRight className="h-4 w-4" />}
        </div>
        
        {isActive && (
          <div className="ml-8 mt-2 space-y-1">
            {(['discover', 'onboard', 'scaffold', 'endgame'] as ExperiencePhase[]).map((phase) => {
              const isAccessible = canAccess(pillar, phase);
              const isCurrentPhase = phase === currentPhase;
              const isRecommended = phase === nextPhase && !isCurrentPhase;
              
              return (
                <ContextualTooltip
                  key={`${pillar}-${phase}`}
                  content={isAccessible ? 
                    `Continue your ${phase} journey in ${label}` : 
                    `Complete your ${currentPhase} journey to unlock ${phase}`
                  }
                >
                  <Link 
                    href={isAccessible ? getPillarPhaseUrl(pillar, phase) : '#'}
                    className={cn(
                      "flex items-center p-2 text-sm rounded border-l-4",
                      isAccessible ? "opacity-100" : "opacity-50 cursor-not-allowed",
                      isCurrentPhase ? "bg-gray-100 dark:bg-gray-800" : "",
                      phaseStyles[phase]
                    )}
                    onClick={(e) => !isAccessible && e.preventDefault()}
                  >
                    <PhaseIcon phase={phase} />
                    <span className="ml-2 capitalize">{phase}</span>
                    {isCurrentPhase && (
                      <Badge variant="outline" className="ml-auto">Current</Badge>
                    )}
                    {isRecommended && (
                      <Badge className="ml-auto bg-amber-500">Next</Badge>
                    )}
                    {!isAccessible && <Lock className="ml-auto h-3 w-3" />}
                  </Link>
                </ContextualTooltip>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center">
          <Sparkles className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-bold">Avolve</span>
        </Link>
      </div>
      
      <div className="mb-6">
        <Link href="/dashboard" className={cn(
          "flex items-center p-2 rounded-lg",
          pathname === '/dashboard' ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}>
          <Home className="h-5 w-5 mr-3" />
          <span>Dashboard</span>
        </Link>
      </div>
      
      <div className="space-y-1">
        {renderPillarNav('superachiever', <Brain className="h-5 w-5" />, 'Superachiever')}
        {renderPillarNav('superachievers', <Users className="h-5 w-5" />, 'Superachievers')}
        {renderPillarNav('supercivilization', <Globe className="h-5 w-5" />, 'Supercivilization')}
      </div>
      
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
        <Link href="/tokens" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Award className="h-5 w-5 mr-3" />
          <span>Tokens</span>
          <Badge variant="outline" className="ml-auto">{tokens?.reduce((sum: number, t: Token) => sum + t.balance, 0) || 0}</Badge>
        </Link>
        
        <Link href="/profile" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Heart className="h-5 w-5 mr-3" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
