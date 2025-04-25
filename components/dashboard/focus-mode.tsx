'use client';

import { useState, useEffect } from 'react';
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
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  Coins,
  Puzzle,
  Users,
  BookOpen,
  Target,
  Lightbulb,
  Zap,
  Globe,
} from 'lucide-react';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';
import {
  useExperiencePhases,
  Pillar,
  ExperiencePhase,
  phaseNames,
  pillarNames,
  Milestone,
} from '@/hooks/use-experience-phases';
import { motion } from 'framer-motion';

interface FocusModeProps {
  userId: string;
}

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: number;
  link: string;
  type: 'milestone' | 'token' | 'achievement' | 'superpuzzle' | 'team' | 'event';
  estimatedTime?: string;
  progress?: number;
  tooltipContent?: string;
  pillar: Pillar;
  phase: ExperiencePhase;
  onComplete?: () => Promise<boolean>;
}

export function FocusMode({ userId }: FocusModeProps) {
  const [recommendedActions, setRecommendedActions] = useState<RecommendedAction[]>([]);
  const [completedAction, setCompletedAction] = useState<string | null>(null);

  const {
    isLoading,
    error,
    userProgress,
    getNextRecommendedActions,
    completeMilestone,
    getCurrentPhase,
    refreshProgress,
  } = useExperiencePhases();

  // Generate recommended actions based on user progress
  useEffect(() => {
    if (!isLoading && userProgress.length > 0) {
      const actions: RecommendedAction[] = [];

      // Add milestone actions from each pillar
      userProgress.forEach(pillarProgress => {
        const pillar = pillarProgress.pillar;
        const nextMilestones = getNextRecommendedActions(pillar);

        nextMilestones.forEach((milestone, index) => {
          // Get appropriate icon based on pillar and milestone type
          let icon: React.ReactNode;

          if (pillar === 'superachiever') {
            if (milestone.name.toLowerCase().includes('personal')) {
              icon = <BookOpen className="h-5 w-5 text-blue-500" />;
            } else if (milestone.name.toLowerCase().includes('business')) {
              icon = <Target className="h-5 w-5 text-green-500" />;
            } else if (milestone.name.toLowerCase().includes('supermind')) {
              icon = <Lightbulb className="h-5 w-5 text-yellow-500" />;
            } else {
              icon = <Award className="h-5 w-5 text-purple-500" />;
            }
          } else if (pillar === 'superachievers') {
            if (
              milestone.name.toLowerCase().includes('team') ||
              milestone.name.toLowerCase().includes('community')
            ) {
              icon = <Users className="h-5 w-5 text-blue-500" />;
            } else if (milestone.name.toLowerCase().includes('puzzle')) {
              icon = <Puzzle className="h-5 w-5 text-orange-500" />;
            } else if (milestone.name.toLowerCase().includes('superhuman')) {
              icon = <Zap className="h-5 w-5 text-yellow-500" />;
            } else {
              icon = <Users className="h-5 w-5 text-indigo-500" />;
            }
          } else {
            if (
              milestone.name.toLowerCase().includes('token') ||
              milestone.name.toLowerCase().includes('governance')
            ) {
              icon = <Coins className="h-5 w-5 text-yellow-500" />;
            } else if (milestone.name.toLowerCase().includes('network')) {
              icon = <Globe className="h-5 w-5 text-blue-500" />;
            } else {
              icon = <Award className="h-5 w-5 text-green-500" />;
            }
          }

          // Create action
          actions.push({
            id: milestone.id,
            title: milestone.name,
            description: milestone.description,
            icon,
            priority: index + 1,
            link: `/dashboard/journey/${pillar}/${milestone.id}`,
            type: 'milestone',
            progress: milestone.progress,
            estimatedTime: milestone.required_for_advancement ? '10-15 min' : '5-10 min',
            tooltipContent: `
              <p class="font-semibold">${milestone.name}</p>
              <p>${milestone.description}</p>
              <div class="mt-2">
                <span class="font-medium">Reward:</span> ${milestone.token_reward} ${milestone.token_type} tokens
              </div>
              <div class="mt-1">
                <span class="font-medium">Phase:</span> ${phaseNames[milestone.phase]}
              </div>
              ${
                milestone.required_for_advancement
                  ? '<div class="mt-1 text-amber-500 font-medium">Required for phase advancement</div>'
                  : ''
              }
            `,
            pillar: pillar,
            phase: milestone.phase,
            onComplete: () => completeMilestone(milestone.id),
          });
        });
      });

      // Sort actions by priority and required for advancement
      actions.sort((a, b) => {
        // First sort by phase (current phase first)
        const aPhaseMatch = a.phase === getCurrentPhase(a.pillar);
        const bPhaseMatch = b.phase === getCurrentPhase(b.pillar);

        if (aPhaseMatch && !bPhaseMatch) return -1;
        if (!aPhaseMatch && bPhaseMatch) return 1;

        // Then sort by priority
        return a.priority - b.priority;
      });

      setRecommendedActions(actions);
    }
  }, [isLoading, userProgress, getNextRecommendedActions, completeMilestone, getCurrentPhase]);

  // Mark an action as completed
  const markActionCompleted = async (actionId: string) => {
    const action = recommendedActions.find(a => a.id === actionId);

    if (action && action.onComplete) {
      const success = await action.onComplete();

      if (success) {
        setCompletedAction(actionId);

        // Refresh the recommended actions
        await refreshProgress();

        // Remove this action from the list
        setRecommendedActions(prev => prev.filter(a => a.id !== actionId));
      }
    }
  };

  // Get phase-specific guidance
  const getPhaseGuidance = (pillar: Pillar, phase: ExperiencePhase): string => {
    switch (phase) {
      case 'discover':
        return `Explore the core concepts of the ${pillarNames[pillar]} pillar`;
      case 'onboard':
        return `Deepen your understanding of ${pillarNames[pillar]} features`;
      case 'scaffold':
        return `Build advanced skills in the ${pillarNames[pillar]} pillar`;
      case 'endgame':
        return `Master and contribute to the ${pillarNames[pillar]} ecosystem`;
      default:
        return `Continue your journey in the ${pillarNames[pillar]} pillar`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Focus Mode</CardTitle>
          <CardDescription>Loading your personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Focus Mode</CardTitle>
          <CardDescription>Personalized recommendations based on your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-red-500">
            Error loading recommendations. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const topAction = recommendedActions[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Mode</CardTitle>
        <CardDescription>
          Personalized recommendations based on your current experience phase
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topAction ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">{topAction.icon}</div>
              <div>
                <h3 className="font-medium text-lg flex items-center">
                  {topAction.title}
                  {topAction.tooltipContent && (
                    <ContextualTooltip content={topAction.tooltipContent} className="ml-1">
                      <></>
                    </ContextualTooltip>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{topAction.description}</p>
                <Badge variant="outline" className="mt-2">
                  {pillarNames[topAction.pillar]} • {phaseNames[topAction.phase]}
                </Badge>
              </div>
            </div>

            {topAction.progress !== undefined && topAction.progress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">{topAction.progress}%</span>
                </div>
                <Progress value={topAction.progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              {topAction.estimatedTime && (
                <Badge variant="outline" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {topAction.estimatedTime}
                </Badge>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (recommendedActions.length > 1) {
                      // Move this action to the end and show the next one
                      setRecommendedActions(prev => {
                        const [first, ...rest] = prev;
                        return [...rest, first];
                      });
                    }
                  }}
                >
                  Skip for now
                </Button>

                <Button size="sm" onClick={() => markActionCompleted(topAction.id)}>
                  Complete
                  <CheckCircle className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="font-medium text-lg">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              You've completed all your recommended actions. Check back later or explore other areas
              of the platform.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full">
          <h4 className="text-sm font-medium mb-2">Up Next</h4>
          <div className="space-y-2">
            {recommendedActions.slice(1, 3).map(action => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="block w-full"
              >
                <div className="flex items-center p-3 rounded-md border hover:border-primary/50 transition-colors">
                  <div className="mr-3">{action.icon}</div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium">{action.title}</h5>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs">
                        {pillarNames[action.pillar]}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => markActionCompleted(action.id)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
