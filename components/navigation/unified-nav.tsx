'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, Users, Globe, Brain, Briefcase, 
  Heart, Award, Zap, ChevronRight, Lock,
  Sparkles, Compass, Map, Flag,
  UserCircle, Building2, Puzzle,
  Users2, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';
import { useSupabase } from '@/components/supabase/provider';
import { superRoutes } from '@/lib/navigation';
import { useTokens, type Token } from '@/hooks/use-tokens';

// Define types for experience phases and route
type ExperiencePhase = 'discover' | 'onboard' | 'scaffold' | 'endgame';

type SuperRoute = {
  path: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
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

/**
 * UnifiedNav Component
 * 
 * A responsive navigation component that adapts to different screen sizes and contexts.
 * Provides a unified navigation experience across desktop and mobile views.
 * 
 * Features:
 * - Responsive layout
 * - Touch-friendly on mobile
 * - Keyboard accessible
 * - Screen reader support
 * 
 * @component
 * @example
 * ```tsx
 * import { UnifiedNav } from '@/components/navigation/unified-nav'
 * 
 * function App() {
 *   return <UnifiedNav routes={superRoutes} />
 * }
 * ```
 */
export function UnifiedNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase, session } = useSupabase();
  const { tokens } = useTokens();
  const [activePath, setActivePath] = useState<string | null>(null);
  
  // Determine active path based on current path
  useEffect(() => {
    const activeRoute = superRoutes.find(route => pathname?.startsWith(route.path));
    setActivePath(activeRoute?.path || null);
  }, [pathname]);

  // Check if a route is accessible based on tokens
  const canAccess = (path: string): boolean => {
    if (!tokens) return false;
    
    // For now, all routes are accessible
    // TODO: Implement token-gating based on requirements
    return true;
  };

  // Get the next recommended phase for a route
  const getNextRecommendedPhase = (path: string): ExperiencePhase => {
    // For now, everyone starts at discover
    // TODO: Implement proper phase progression
    return 'discover';
  };

  // Generate the URL for a route and phase
  const getRoutePhaseUrl = (path: string, phase: ExperiencePhase): string => {
    return `${path}/${phase}`;
  };

  // Render a navigation item with its phases
  const renderRouteNav = (route: SuperRoute) => {
    const isActive = pathname?.startsWith(route.path);
    const currentPhase: ExperiencePhase = 'discover'; // TODO: Get from user progress
    const nextPhase = getNextRecommendedPhase(route.path);
    
    return (
      <div key={route.path} className="mb-2">
        <div 
          className={cn(
            "flex items-center p-2 rounded-lg cursor-pointer transition-colors",
            isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          onClick={() => router.push(getRoutePhaseUrl(route.path, currentPhase))}
        >
          <div className="mr-2 text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 p-2 rounded-md">
            <route.icon className="h-5 w-5" />
          </div>
          <span className="flex-1 font-medium">{route.label}</span>
          {isActive && <ChevronRight className="h-4 w-4" />}
        </div>
        
        {isActive && (
          <div className="ml-8 mt-2 space-y-1">
            {(['discover', 'onboard', 'scaffold', 'endgame'] as ExperiencePhase[]).map((phase) => {
              const isAccessible = canAccess(route.path);
              const isCurrentPhase = phase === currentPhase;
              const isRecommended = phase === nextPhase && !isCurrentPhase;
              
              return (
                <ContextualTooltip
                  key={`${route.path}-${phase}`}
                  content={isAccessible ? 
                    `Continue your ${phase} journey in ${route.label}` : 
                    `Complete your ${currentPhase} journey to unlock ${phase}`
                  }
                >
                  <Link 
                    href={isAccessible ? getRoutePhaseUrl(route.path, phase) : '#'}
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
        {superRoutes.map(route => renderRouteNav(route))}
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
