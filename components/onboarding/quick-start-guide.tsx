'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

// Define quick start guides based on experience phases
const phaseGuides = {
  discovery: [
    { 
      title: 'Complete Your Profile', 
      description: 'Add your details and preferences to personalize your experience.',
      link: '/dashboard/profile',
      action: 'Update Profile',
      taskKey: 'profile_completed'
    },
    { 
      title: 'Take the Superachiever Assessment', 
      description: 'Discover your strengths and areas for growth with our assessment.',
      link: '/dashboard/assessment',
      action: 'Start Assessment',
      taskKey: 'assessment_completed'
    },
    { 
      title: 'Claim Your First Tokens', 
      description: 'Complete your first daily claim to receive GEN tokens.',
      link: '/dashboard/tokens',
      action: 'Claim Tokens',
      taskKey: 'first_token_claim'
    },
  ],
  onboarding: [
    { 
      title: 'Join Your First Team', 
      description: 'Connect with others by joining or creating a team.',
      link: '/teams',
      action: 'Explore Teams',
      taskKey: 'team_joined'
    },
    { 
      title: 'Complete a Journey Component', 
      description: 'Start your journey by completing your first component.',
      link: '/dashboard/journey',
      action: 'Start Journey',
      taskKey: 'journey_component_completed'
    },
    { 
      title: 'Set Up Verification', 
      description: 'Verify your identity to unlock additional features.',
      link: '/dashboard/verification',
      action: 'Verify Now',
      taskKey: 'verification_started'
    },
  ],
  scaffolding: [
    { 
      title: 'Contribute to a Superpuzzle', 
      description: 'Add your insights to community superpuzzles.',
      link: '/superpuzzles',
      action: 'Explore Superpuzzles',
      taskKey: 'superpuzzle_contribution'
    },
    { 
      title: 'Participate in Governance', 
      description: 'Vote on community proposals and help shape Avolve.',
      link: '/governance',
      action: 'View Proposals',
      taskKey: 'governance_participation'
    },
    { 
      title: 'Earn Specialized Tokens', 
      description: 'Complete activities to earn specialized utility tokens.',
      link: '/dashboard/tokens',
      action: 'View Token Guide',
      taskKey: 'utility_token_earned'
    },
  ],
  endgame: [
    { 
      title: 'Create a Community Proposal', 
      description: 'Submit your ideas for improving the Avolve ecosystem.',
      link: '/governance/propose',
      action: 'Create Proposal',
      taskKey: 'proposal_created'
    },
    { 
      title: 'Mentor New Members', 
      description: 'Help onboard new members and earn mentor rewards.',
      link: '/dashboard/mentorship',
      action: 'Become a Mentor',
      taskKey: 'mentorship_started'
    },
    { 
      title: 'Achieve Network State Status', 
      description: 'Reach the highest level of participation in the Avolve ecosystem.',
      link: '/dashboard/network-state',
      action: 'View Requirements',
      taskKey: 'network_state_progress'
    },
  ]
};

interface QuickStartGuideProps {
  userId: string;
}

export function QuickStartGuide({ userId }: QuickStartGuideProps) {
  const [userPhase, setUserPhase] = useState<string>('discovery');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('discovery');
  const supabase = createClientComponentClient();

  // Fetch user's current experience phase and completed tasks
  useEffect(() => {
    async function fetchUserData() {
      // Fetch user phase
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('experience_phase')
        .eq('user_id', userId)
        .single();

      if (profileData && !profileError) {
        const phase = profileData.experience_phase || 'discovery';
        setUserPhase(phase);
        setActiveTab(phase);
      }

      // Fetch completed onboarding tasks
      const { data: taskData, error: taskError } = await supabase
        .from('user_onboarding')
        .select('completed_tasks')
        .eq('user_id', userId)
        .single();

      if (taskData && !taskError && taskData.completed_tasks) {
        setCompletedTasks(taskData.completed_tasks);
      }
    }

    fetchUserData();
  }, [userId, supabase]);

  // Mark a task as completed
  const markTaskCompleted = async (taskKey: string) => {
    if (completedTasks.includes(taskKey)) return;
    
    const updatedTasks = [...completedTasks, taskKey];
    setCompletedTasks(updatedTasks);
    
    await supabase
      .from('user_onboarding')
      .upsert({ 
        user_id: userId, 
        completed_tasks: updatedTasks,
        updated_at: new Date().toISOString()
      });
  };

  // Get available phases based on user's current phase
  const getAvailablePhases = () => {
    const phases = ['discovery', 'onboarding', 'scaffolding', 'endgame'];
    const currentIndex = phases.indexOf(userPhase);
    return phases.slice(0, currentIndex + 1);
  };

  const availablePhases = getAvailablePhases();
  const phaseLabels = {
    discovery: 'Discovery',
    onboarding: 'Onboarding',
    scaffolding: 'Scaffolding',
    endgame: 'Endgame'
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quick Start Guide</CardTitle>
        <CardDescription>
          Follow these steps to get the most out of your Avolve experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {Object.entries(phaseLabels).map(([phase, label]) => (
              <TabsTrigger 
                key={phase} 
                value={phase}
                disabled={!availablePhases.includes(phase)}
                className="relative"
              >
                {label}
                {!availablePhases.includes(phase) && (
                  <Lock className="h-3 w-3 ml-1 inline" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(phaseGuides).map(([phase, tasks]) => (
            <TabsContent key={phase} value={phase} className="space-y-4">
              {tasks.map((task, index) => {
                const isCompleted = completedTasks.includes(task.taskKey);
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isCompleted 
                        ? 'border-green-600 bg-green-950/20' 
                        : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium flex items-center">
                          {task.title}
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      </div>
                      <Link href={task.link}>
                        <Button 
                          size="sm" 
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => !isCompleted && markTaskCompleted(task.taskKey)}
                          className="ml-4"
                        >
                          {task.action}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between border-t border-zinc-800 pt-4">
        <div className="text-sm text-muted-foreground">
          {completedTasks.length} tasks completed
        </div>
        <Badge variant="outline">
          {/* userPhase should be a key of phaseLabels, fallback to 'onboarding' if not found */}
          {phaseLabels[userPhase as keyof typeof phaseLabels] ?? phaseLabels['onboarding']} Phase
        </Badge>
      </CardFooter>
    </Card>
  );
}
