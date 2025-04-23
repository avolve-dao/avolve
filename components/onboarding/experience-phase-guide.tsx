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
  LockIcon,
  PlusCircleIcon
} from 'lucide-react';

// Define types for experience phases
export type ExperiencePhase = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame';

type PhaseInfo = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradientClass: string;
};

type NextAction = {
  id: string;
  title: string;
  description: string;
  path: string;
  tokenRequired?: string;
  completed: boolean;
  locked: boolean;
};

type PillarProgress = {
  pillar_id: string;
  pillar_title: string;
  pillar_slug: string;
  gradient_class: string;
  total_sections: number;
  completed_sections: number;
  total_components: number;
  completed_components: number;
  progress_percentage: number;
};

type ExperiencePhaseGuideProps = {
  userId?: string;
  showNextActions?: boolean;
  showPillarProgress?: boolean;
  maxNextActions?: number;
  className?: string;
};

export default function ExperiencePhaseGuide({
  userId,
  showNextActions = true,
  showPillarProgress = true,
  maxNextActions = 3,
  className = '',
}: ExperiencePhaseGuideProps) {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const { trackActivity, ...tokenContext } = useTokens();
  
  const [currentPhase, setCurrentPhase] = useState<ExperiencePhase | null>(null);
  const [nextActions, setNextActions] = useState<NextAction[]>([]);
  const [pillarProgress, setPillarProgress] = useState<PillarProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Phase information with visual styling
  const phaseInfo: Record<ExperiencePhase, PhaseInfo> = {
    discovery: {
      title: 'Discovery Phase',
      description: 'Explore the platform and understand the core concepts of Avolve.',
      icon: <BookOpenIcon className="h-6 w-6" />,
      color: 'text-blue-500',
      gradientClass: 'from-blue-400 to-blue-600',
    },
    onboarding: {
      title: 'Onboarding Phase',
      description: 'Learn the fundamentals and start your journey of transformation.',
      icon: <RocketIcon className="h-6 w-6" />,
      color: 'text-green-500',
      gradientClass: 'from-green-400 to-green-600',
    },
    scaffolding: {
      title: 'Scaffolding Phase',
      description: 'Build your success puzzles and develop your superpowers.',
      icon: <LayersIcon className="h-6 w-6" />,
      color: 'text-purple-500',
      gradientClass: 'from-purple-400 to-purple-600',
    },
    endgame: {
      title: 'Endgame Phase',
      description: 'Master advanced concepts and contribute to the supercivilization.',
      icon: <TrophyIcon className="h-6 w-6" />,
      color: 'text-amber-500',
      gradientClass: 'from-amber-400 to-amber-600',
    },
  };
  
  useEffect(() => {
    const fetchUserPhase = async () => {
      setIsLoading(true);
      try {
        const targetUserId = userId || user?.id;
        if (!targetUserId) return;
        
        // Get user experience phase (fallback: 'onboarding')
        setCurrentPhase('onboarding');
        
        // Track this view for analytics
        await trackActivity('view_phase_guide', 'experience_phase', 'onboarding');
        
        // Get next recommended actions (fallback: empty array)
        setNextActions([]);
        
        // Get pillar progress if needed
        if (showPillarProgress) {
          const { data: progress } = await supabase
            .rpc('get_all_pillars_progress');
          
          setPillarProgress(progress || []);
        }
      } catch (error) {
        console.error('Error fetching user phase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPhase();
  }, [userId, user?.id, supabase, tokenContext, trackActivity, showPillarProgress, maxNextActions]);
  
  const handleActionClick = async (action: NextAction) => {
    if (action.locked) return;
    
    // Track the click for analytics
    await trackActivity('click_recommended_action', 'action', action.id, {
      action_title: action.title,
      action_path: action.path
    });
    
    // Navigate to the action path
    router.push(action.path);
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
  
  if (!currentPhase) {
    return null;
  }
  
  const phase = phaseInfo[currentPhase];
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className={`bg-gradient-to-r ${phase.gradientClass} text-white`}>
        <div className="flex items-center gap-3">
          {phase.icon}
          <div>
            <CardTitle>{phase.title}</CardTitle>
            <CardDescription className="text-white/80">{phase.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Phase Progress Visualization */}
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <span>Discovery</span>
            <span>Onboarding</span>
            <span>Scaffolding</span>
            <span>Endgame</span>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full bg-gradient-to-r ${
                    currentPhase === 'discovery' ? 'w-1/4 from-blue-400 to-blue-600' :
                    currentPhase === 'onboarding' ? 'w-2/4 from-blue-400 via-green-400 to-green-600' :
                    currentPhase === 'scaffolding' ? 'w-3/4 from-blue-400 via-green-400 via-purple-400 to-purple-600' :
                    'w-full from-blue-400 via-green-400 via-purple-400 to-amber-600'
                  }`}
                ></div>
              </div>
            </div>
            <div className="flex justify-between w-full px-2">
              <div className={`h-4 w-4 rounded-full ${currentPhase === 'discovery' ? 'bg-blue-500 ring-4 ring-blue-200' : 'bg-blue-500'}`}></div>
              <div className={`h-4 w-4 rounded-full ${currentPhase === 'onboarding' ? 'bg-green-500 ring-4 ring-green-200' : currentPhase === 'scaffolding' || currentPhase === 'endgame' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`h-4 w-4 rounded-full ${currentPhase === 'scaffolding' ? 'bg-purple-500 ring-4 ring-purple-200' : currentPhase === 'endgame' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              <div className={`h-4 w-4 rounded-full ${currentPhase === 'endgame' ? 'bg-amber-500 ring-4 ring-amber-200' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
        
        {/* Next Recommended Actions */}
        {showNextActions && nextActions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Next Steps</h3>
            <div className="space-y-3">
              {nextActions.map((action) => (
                <div 
                  key={action.id}
                  className={`p-3 border rounded-lg ${
                    action.locked ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !action.locked && handleActionClick(action)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {action.completed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : action.locked ? (
                        <LockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      ) : (
                        <PlusCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                    {action.tokenRequired && (
                      <Badge variant="outline" className="ml-2">
                        {action.tokenRequired}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pillar Progress */}
        {showPillarProgress && pillarProgress.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Your Progress</h3>
            <div className="space-y-4">
              {pillarProgress.map((pillar) => (
                <div key={pillar.pillar_id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{pillar.pillar_title}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(pillar.progress_percentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={pillar.progress_percentage} 
                    className={`h-2 bg-gray-100 ${
                      pillar.gradient_class.includes('stone') ? 'bg-gradient-to-r from-stone-400 to-stone-600' :
                      pillar.gradient_class.includes('slate') ? 'bg-gradient-to-r from-slate-400 to-slate-600' :
                      pillar.gradient_class.includes('zinc') ? 'bg-gradient-to-r from-zinc-400 to-zinc-600' :
                      pillar.gradient_class.includes('blue') ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`} 
                  />
                  <div className="text-xs text-gray-500">
                    {pillar.completed_components}/{pillar.total_components} components completed
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Dashboard
        </Button>
        <Button 
          className={`bg-gradient-to-r ${phase.gradientClass} text-white`}
          onClick={() => router.push('/learn')}
        >
          Continue Learning
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
