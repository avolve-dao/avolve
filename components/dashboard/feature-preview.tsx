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
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '../../lib/supabase/client';
import { Lock, Star, Info, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';
import Link from 'next/link';

interface FeatureRequirement {
  type: 'token' | 'achievement' | 'component' | 'phase';
  id: string;
  amount?: number;
  name: string;
  description: string;
  current?: number;
  max?: number;
}

interface FeatureDefinition {
  title: string;
  description: string;
  image: string;
  tooltipType?: string;
  unlockPath: string;
  unlockPhase: string;
  requirements: FeatureRequirement[];
}

interface FeaturePreviewProps {
  userId: string;
  features?: string[];
}

// Define available features with unlock requirements
const featureDefinitions: { [key: string]: FeatureDefinition } = {
  superpuzzles: {
    title: 'Superpuzzles',
    description: 'Collaborate with the community to solve complex challenges and earn SCQ tokens.',
    image: '/features/superpuzzles.png',
    tooltipType: 'superpuzzles',
    unlockPath: '/superpuzzles',
    unlockPhase: 'scaffolding',
    requirements: [
      {
        type: 'token',
        id: 'GEN',
        amount: 100,
        name: 'GEN Tokens',
        description: 'Accumulate GEN tokens through platform activities',
      },
      {
        type: 'achievement',
        id: 'first_component_completed',
        name: 'Complete First Component',
        description: 'Complete at least one journey component',
      },
    ],
  },
  governance: {
    title: 'Governance',
    description: 'Participate in community decision-making and shape the future of Avolve.',
    image: '/features/governance.png',
    tooltipType: 'fractally',
    unlockPath: '/governance',
    unlockPhase: 'endgame',
    requirements: [
      {
        type: 'token',
        id: 'GEN',
        amount: 500,
        name: 'GEN Tokens',
        description: 'Accumulate GEN tokens through platform activities',
      },
      {
        type: 'achievement',
        id: 'active_contributor',
        name: 'Active Contributor',
        description: 'Contribute to at least 3 superpuzzles',
      },
      {
        type: 'phase',
        id: 'scaffolding',
        name: 'Scaffolding Phase',
        description: 'Reach the Scaffolding experience phase',
      },
    ],
  },
  mentorship: {
    title: 'Mentorship Program',
    description: 'Guide new members and earn mentor rewards while building your reputation.',
    image: '/features/mentorship.png',
    unlockPath: '/dashboard/mentorship',
    unlockPhase: 'scaffolding',
    requirements: [
      {
        type: 'token',
        id: 'SAP',
        amount: 50,
        name: 'SAP Tokens',
        description: 'Earn Superachiever Pillar tokens',
      },
      {
        type: 'component',
        id: 'leadership_basics',
        name: 'Leadership Basics',
        description: 'Complete the Leadership Basics component',
      },
    ],
  },
  network_state: {
    title: 'Network State',
    description: 'Access advanced governance features and digital citizenship benefits.',
    image: '/features/network-state.png',
    tooltipType: 'network_state',
    unlockPath: '/dashboard/network-state',
    unlockPhase: 'endgame',
    requirements: [
      {
        type: 'token',
        id: 'GEN',
        amount: 1000,
        name: 'GEN Tokens',
        description: 'Accumulate GEN tokens through platform activities',
      },
      {
        type: 'achievement',
        id: 'governance_participation',
        name: 'Governance Participation',
        description: 'Vote on at least 5 governance proposals',
      },
      {
        type: 'phase',
        id: 'endgame',
        name: 'Endgame Phase',
        description: 'Reach the Endgame experience phase',
      },
    ],
  },
  advanced_analytics: {
    title: 'Advanced Analytics',
    description: 'Access detailed metrics and insights about your progress and contributions.',
    image: '/features/analytics.png',
    unlockPath: '/dashboard/analytics',
    unlockPhase: 'scaffolding',
    requirements: [
      {
        type: 'token',
        id: 'GEN',
        amount: 250,
        name: 'GEN Tokens',
        description: 'Accumulate GEN tokens through platform activities',
      },
      {
        type: 'achievement',
        id: 'data_driven',
        name: 'Data Driven',
        description: 'Complete the Data Literacy component',
      },
    ],
  },
  token_exchange: {
    title: 'Token Exchange',
    description: 'Convert between different token types and access advanced token features.',
    image: '/features/token-exchange.png',
    tooltipType: 'utility_tokens',
    unlockPath: '/tokens/exchange',
    unlockPhase: 'endgame',
    requirements: [
      {
        type: 'token',
        id: 'GEN',
        amount: 750,
        name: 'GEN Tokens',
        description: 'Accumulate GEN tokens through platform activities',
      },
      {
        type: 'achievement',
        id: 'token_collector',
        name: 'Token Collector',
        description: 'Earn at least 3 different utility token types',
      },
    ],
  },
};

export function FeaturePreview({ userId, features }: FeaturePreviewProps) {
  const [userPhase, setUserPhase] = useState<string>('discovery');
  const [userTokens, setUserTokens] = useState<{ [key: string]: number }>({});
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [userComponents, setUserComponents] = useState<string[]>([]);
  const [featureProgress, setFeatureProgress] = useState<{ [key: string]: number }>({});
  const supabase = createClient();

  // Determine which features to show
  const featuresToShow = features || Object.keys(featureDefinitions);

  // Fetch user data to check requirements
  useEffect(() => {
    async function fetchUserData() {
      // Fetch user's experience phase
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('experience_phase')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setUserPhase(profileData.experience_phase || 'discovery');
      }

      // Fetch user's tokens
      const { data: tokensData } = await supabase
        .from('user_tokens')
        .select('token_type, amount')
        .eq('user_id', userId);

      if (tokensData) {
        const tokens: { [key: string]: number } = {};
        tokensData.forEach((token: any) => {
          tokens[token.token_type] = token.amount || 0;
        });
        setUserTokens(tokens);
      }

      // Fetch user's achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      if (achievementsData) {
        setUserAchievements(achievementsData.map((a: any) => a.achievement_id));
      }

      // Fetch user's completed components
      const { data: componentsData } = await supabase
        .from('component_progress')
        .select('component_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (componentsData) {
        setUserComponents(componentsData.map((c: any) => c.component_id));
      }
    }

    fetchUserData();
  }, [userId, supabase]);

  // Calculate feature progress whenever user data changes
  useEffect(() => {
    const phaseOrder = ['discovery', 'onboarding', 'scaffolding', 'endgame'];
    const userPhaseIndex = phaseOrder.indexOf(userPhase);

    const progress: { [key: string]: number } = {};

    // Calculate progress for each feature
    Object.entries(featureDefinitions).forEach(([featureKey, feature]) => {
      if (!featuresToShow.includes(featureKey)) return;

      // Check if feature is unlocked based on user's phase
      const featurePhaseIndex = phaseOrder.indexOf(feature.unlockPhase);
      if (userPhaseIndex >= featurePhaseIndex) {
        progress[featureKey] = 100;
        return;
      }

      // Calculate progress based on requirements
      const totalRequirements = feature.requirements.length;
      let completedRequirements = 0;

      feature.requirements.forEach(req => {
        let isCompleted = false;

        switch (req.type) {
          case 'token':
            const userAmount = userTokens[req.id] || 0;
            req.current = userAmount;
            req.max = req.amount || 0;
            isCompleted = userAmount >= (req.amount || 0);
            break;

          case 'achievement':
            req.current = userAchievements.includes(req.id) ? 1 : 0;
            req.max = 1;
            isCompleted = userAchievements.includes(req.id);
            break;

          case 'component':
            req.current = userComponents.includes(req.id) ? 1 : 0;
            req.max = 1;
            isCompleted = userComponents.includes(req.id);
            break;

          case 'phase':
            const reqPhaseIndex = phaseOrder.indexOf(req.id);
            const currentPhaseIndex = phaseOrder.indexOf(userPhase);
            req.current = currentPhaseIndex;
            req.max = reqPhaseIndex;
            isCompleted = currentPhaseIndex >= reqPhaseIndex;
            break;
        }

        if (isCompleted) {
          completedRequirements++;
        }
      });

      progress[featureKey] =
        totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
    });

    setFeatureProgress(progress);
  }, [userPhase, userTokens, userAchievements, userComponents, featuresToShow]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {featuresToShow.map(featureKey => {
        const feature = featureDefinitions[featureKey as keyof typeof featureDefinitions];
        if (!feature) return null;

        const isUnlocked = featureProgress[featureKey] === 100;
        const progress = featureProgress[featureKey] || 0;

        return (
          <Card
            key={featureKey}
            className={`overflow-hidden transition-all duration-300 ${
              isUnlocked ? 'border-green-600' : 'border-zinc-800'
            }`}
          >
            {feature.image && (
              <div className="relative h-32 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                {!isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Coming Soon
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                {feature.title}
                {feature.tooltipType && (
                  <ContextualTooltip type={feature.tooltipType as any} className="ml-1">
                    <></>
                  </ContextualTooltip>
                )}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Unlock Progress</span>
                  <span className="text-sm">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {!isUnlocked && feature.requirements && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Requirements to Unlock:</h4>
                  {feature.requirements.map((req, index) => (
                    <div key={index} className="flex items-start justify-between text-sm">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span>{req.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{req.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {req.type === 'token' && req.amount && (
                          <Progress
                            value={((req.current ?? 0) / (req.max ?? 0)) * 100}
                            className="h-1 mt-1"
                          />
                        )}
                      </div>
                      <div className="ml-2 flex items-center">
                        {req.type === 'token' && req.amount ? (
                          <Badge variant="outline" className="ml-auto">
                            {req.current ?? 0}/{req.amount ?? 0}
                          </Badge>
                        ) : (
                          <Badge
                            variant={(req.current ?? 0) >= (req.max ?? 0) ? 'success' : 'outline'}
                            className="ml-auto"
                          >
                            {(req.current ?? 0) >= (req.max ?? 0) ? (
                              <Star className="h-3 w-3 mr-1 fill-current" />
                            ) : null}
                            {(req.current ?? 0) >= (req.max ?? 0) ? 'Completed' : 'Incomplete'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              {isUnlocked ? (
                <Link href={feature.unlockPath} className="w-full">
                  <Button className="w-full">
                    Access Feature
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full">
                  Locked
                  <Lock className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
