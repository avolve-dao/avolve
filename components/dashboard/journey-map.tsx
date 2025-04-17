'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Lock, Star, Trophy, AlertCircle } from 'lucide-react';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';
import { useExperiencePhases, Pillar, ExperiencePhase, phaseNames, pillarNames, Milestone } from '@/hooks/use-experience-phases';
import { PhaseCelebration } from './phase-celebration';
import { motion } from 'framer-motion';

interface JourneyMapProps {
  userId: string;
}

export function JourneyMap({ userId }: JourneyMapProps) {
  const [activeTab, setActiveTab] = useState<Pillar>('superachiever');
  
  const {
    isLoading,
    error,
    userProgress,
    showCelebration,
    celebrationData,
    dismissCelebration,
    getCurrentPhase,
    getPhaseProgress,
    getAvailableMilestones,
    getCompletedMilestones,
    completeMilestone,
    updateMilestoneProgress
  } = useExperiencePhases();

  // Set default active tab based on user progress
  useEffect(() => {
    if (userProgress.length > 0 && !activeTab) {
      setActiveTab('superachiever');
    }
  }, [userProgress, activeTab]);

  // Calculate overall progress across all pillars
  const calculateOverallProgress = () => {
    if (userProgress.length === 0) return 0;
    
    // Count total phases completed
    let completedPhases = 0;
    const totalPhases = userProgress.length * 4; // 4 phases per pillar
    
    userProgress.forEach(pillar => {
      const phaseIndex = ['discover', 'onboard', 'scaffold', 'endgame'].indexOf(pillar.current_phase);
      completedPhases += phaseIndex; // Add completed phases
      
      // Add partial progress for current phase
      completedPhases += pillar.phase_progress / 100;
    });
    
    return (completedPhases / totalPhases) * 100;
  };

  // Get phase color
  const getPhaseColor = (phase: ExperiencePhase) => {
    switch (phase) {
      case 'discover':
        return 'bg-blue-500';
      case 'onboard':
        return 'bg-green-500';
      case 'scaffold':
        return 'bg-yellow-500';
      case 'endgame':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get milestone status
  const getMilestoneStatus = (milestone: Milestone) => {
    const isCompleted = milestone.completed_at !== undefined;
    const inProgress = !isCompleted && (milestone.progress || 0) > 0;
    
    return {
      isCompleted,
      inProgress,
      progress: milestone.progress || 0
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Map</CardTitle>
          <CardDescription>Loading your progress...</CardDescription>
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
          <CardTitle>Your Journey Map</CardTitle>
          <CardDescription>There was an error loading your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {showCelebration && celebrationData && (
        <PhaseCelebration 
          pillar={celebrationData.pillar}
          phase={celebrationData.phase}
          onDismiss={dismissCelebration}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Map</CardTitle>
          <CardDescription>
            Track your progress through the Avolve experience phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Overall Progress</h3>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Pillar)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="superachiever" className="relative">
                Superachiever
                {userProgress.find(p => p.pillar === 'superachiever')?.current_phase && (
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPhaseColor(getCurrentPhase('superachiever'))}`}></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="superachievers" className="relative">
                Superachievers
                {userProgress.find(p => p.pillar === 'superachievers')?.current_phase && (
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPhaseColor(getCurrentPhase('superachievers'))}`}></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="supercivilization" className="relative">
                Supercivilization
                {userProgress.find(p => p.pillar === 'supercivilization')?.current_phase && (
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPhaseColor(getCurrentPhase('supercivilization'))}`}></span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {(['superachiever', 'superachievers', 'supercivilization'] as Pillar[]).map((pillar) => (
              <TabsContent key={pillar} value={pillar}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{pillarNames[pillar]}</h3>
                      <p className="text-sm text-muted-foreground">
                        Current Phase: {phaseNames[getCurrentPhase(pillar)]}
                      </p>
                    </div>
                    <ContextualTooltip content={`
                      <p class="font-semibold">Experience Phases</p>
                      <p>Your journey through each pillar progresses through four phases:</p>
                      <ul class="list-disc pl-4 mt-1">
                        <li><span class="font-medium">Discovery</span>: Introduction to core concepts</li>
                        <li><span class="font-medium">Onboarding</span>: Guided exploration of features</li>
                        <li><span class="font-medium">Scaffolding</span>: Deeper engagement with advanced features</li>
                        <li><span class="font-medium">Endgame</span>: Mastery and contribution</li>
                      </ul>
                    `}>
                      <Button variant="ghost" size="sm">
                        <span className="mr-1">About Phases</span>
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </ContextualTooltip>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">
                        Phase Progress: {phaseNames[getCurrentPhase(pillar)]}
                      </span>
                      <span className="text-xs">
                        {getPhaseProgress(pillar)}%
                      </span>
                    </div>
                    <Progress 
                      value={getPhaseProgress(pillar)} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-3">Current Phase Milestones</h4>
                    
                    {getAvailableMilestones(pillar).length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Trophy className="h-8 w-8 mx-auto mb-2" />
                        <p>You've completed all milestones for this phase!</p>
                      </div>
                    ) : (
                      getAvailableMilestones(pillar)
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                        .map((milestone, index) => {
                          const { isCompleted, inProgress, progress } = getMilestoneStatus(milestone);
                          
                          return (
                            <motion.div 
                              key={milestone.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                            >
                              <div className="flex">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-600' 
                                    : inProgress 
                                      ? 'bg-blue-100 text-blue-600' 
                                      : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                  )}
                                </div>
                                
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{milestone.name}</h4>
                                    <Badge variant="outline" className="flex items-center">
                                      <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                      {milestone.token_reward} {milestone.token_type}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {milestone.description}
                                  </p>
                                  
                                  {inProgress && (
                                    <div className="mt-2">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium">
                                          In Progress
                                        </span>
                                        <span className="text-xs">
                                          {progress}%
                                        </span>
                                      </div>
                                      <Progress 
                                        value={progress} 
                                        className="h-1" 
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="mt-3">
                                    {isCompleted ? (
                                      <Badge variant="outline" className="bg-green-50">
                                        Completed
                                        <CheckCircle className="h-3 w-3 ml-1" />
                                      </Badge>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant={inProgress ? "outline" : "default"}
                                        onClick={() => completeMilestone(milestone.id)}
                                      >
                                        {inProgress ? 'Complete' : 'Start'}
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                    )}
                  </div>
                  
                  {getCompletedMilestones(pillar).length > 0 && (
                    <div className="mt-8 space-y-2">
                      <h4 className="text-sm font-medium mb-3">Completed Milestones</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getCompletedMilestones(pillar)
                          .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
                          .slice(0, 4) // Show only the 4 most recent
                          .map((milestone) => (
                            <div 
                              key={milestone.id}
                              className="border rounded-lg p-3 bg-gray-50"
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                                <div className="ml-3">
                                  <h5 className="text-sm font-medium">{milestone.name}</h5>
                                  <p className="text-xs text-muted-foreground">
                                    {milestone.completed_at && new Date(milestone.completed_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      
                      {getCompletedMilestones(pillar).length > 4 && (
                        <div className="text-center mt-2">
                          <Button variant="link" size="sm">
                            View All Completed Milestones
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
