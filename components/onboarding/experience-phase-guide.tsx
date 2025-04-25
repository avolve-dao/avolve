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
  PlusCircleIcon,
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
          const { data: progress } = await supabase.rpc('get_all_pillars_progress');

          setPillarProgress(progress || []);
        }
      } catch (error) {
        console.error('Error fetching user phase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserPhase();
    } else {
      setIsLoading(false);
    }
  }, [user, userId, supabase, showPillarProgress, trackActivity]);

  const handleActionClick = (action: NextAction) => {
    // Track the click for analytics
    trackActivity('click_next_action', 'next_action', action.id);

    // Navigate to the action path
    router.push(action.path);
  };

  if (isLoading) {
    return (
      <Card className={`w-full animate-pulse ${className}`}>
        <CardHeader className="pb-4">
          <div className="h-7 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
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
    <Card className={`w-full border shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full bg-gradient-to-r ${phase.gradientClass}`}>
            <div className="text-white">{phase.icon}</div>
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">{phase.title}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {phase.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Phase Progress */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-lg font-medium">Your Journey</h3>
            <Badge variant="outline" className="px-3 py-1 font-medium">
              Phase {currentPhase === 'discovery' ? '1/4' : currentPhase === 'onboarding' ? '2/4' : currentPhase === 'scaffolding' ? '3/4' : '4/4'}
            </Badge>
          </div>

          <div className="relative">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-blue-500">Discovery</span>
              <span className="text-xs font-medium text-green-500">Onboarding</span>
              <span className="text-xs font-medium text-purple-500">Scaffolding</span>
              <span className="text-xs font-medium text-amber-500">Endgame</span>
            </div>

            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-blue-400 via-green-400 via-purple-400 to-amber-400`}
                style={{
                  width: `${
                    currentPhase === 'discovery'
                      ? 12.5
                      : currentPhase === 'onboarding'
                      ? 37.5
                      : currentPhase === 'scaffolding'
                      ? 62.5
                      : 87.5
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Next Recommended Actions */}
        {showNextActions && nextActions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Next Steps</h3>
            <div className="space-y-3">
              {nextActions.map(action => (
                <div
                  key={action.id}
                  className={`p-3 border rounded-lg transition-colors duration-200 ${
                    action.locked
                      ? 'bg-gray-50 cursor-not-allowed'
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !action.locked && handleActionClick(action)}
                  role="button"
                  tabIndex={action.locked ? -1 : 0}
                  aria-disabled={action.locked}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex items-start gap-3">
                      {action.completed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : action.locked ? (
                        <LockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <PlusCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                    {action.tokenRequired && (
                      <Badge variant="outline" className="mt-2 sm:mt-0 sm:ml-2">
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
              {pillarProgress.map(pillar => (
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
                      pillar.gradient_class.includes('stone')
                        ? 'bg-gradient-to-r from-stone-400 to-stone-600'
                        : pillar.gradient_class.includes('slate')
                          ? 'bg-gradient-to-r from-slate-400 to-slate-600'
                          : pillar.gradient_class.includes('zinc')
                            ? 'bg-gradient-to-r from-zinc-400 to-zinc-600'
                            : pillar.gradient_class.includes('blue')
                              ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
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

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 border-t pt-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
          Dashboard
        </Button>
        <Button
          className={`w-full sm:w-auto bg-gradient-to-r ${phase.gradientClass} text-white`}
          onClick={() => router.push('/learn')}
        >
          Continue Learning
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
