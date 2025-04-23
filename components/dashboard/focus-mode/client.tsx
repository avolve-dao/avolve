'use client';

/**
 * Focus Mode Client Component
 * 
 * Client-side interactive component for displaying personalized focus areas and recommendations
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';

// UI components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Types
import type { PhaseId, MilestoneCompletion } from '@/types/experience';

export interface FocusArea {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  progress: number | null;
  actions: Array<{
    label: string;
    action: string;
  }>;
}

interface ContentRecommendation {
  id: string;
  title: string;
  type: string;
}

interface FeatureRecommendation {
  id: string;
  name: string;
  reason: string;
}

interface LearningPathRecommendation {
  id: string;
  name: string;
  description: string;
  modules: number;
  estimatedTime: string;
}

interface FocusModeClientProps {
  userName: string;
  currentPhase: PhaseId;
  phaseProgress: Record<PhaseId, number>;
  overallProgress: number;
  focusAreas: FocusArea[];
  contentRecommendations: ContentRecommendation[];
  featureRecommendations: FeatureRecommendation[];
  learningPathRecommendations: LearningPathRecommendation[];
  nextMilestones: MilestoneCompletion[];
}

export function FocusModeClient({
  userName,
  currentPhase,
  phaseProgress,
  overallProgress,
  focusAreas,
  contentRecommendations,
  featureRecommendations,
  learningPathRecommendations,
  nextMilestones
}: FocusModeClientProps) {
  const [activeTab, setActiveTab] = useState<string>('focus');
  
  // Get priority focus area
  const priorityFocus = focusAreas.find(area => area.priority === 'high') || focusAreas[0];
  
  return (
    <div className="space-y-6">
      {/* Welcome and progress overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Welcome back, {userName}!</h2>
            <p className="text-muted-foreground">
              You're in the <span className="font-medium text-blue-700">{currentPhase}</span> phase
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-blue-100">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{Math.round(overallProgress)}% Complete</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(['discovery', 'onboarding', 'scaffolding', 'endgame'] as PhaseId[]).map((phase) => (
              <div key={phase} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{phase}</div>
                <Progress 
                  value={phaseProgress[phase]} 
                  className={`h-1 ${currentPhase === phase ? 'bg-blue-100' : ''}`} 
                />
                <div className="text-xs mt-1">{Math.round(phaseProgress[phase])}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tabs for different focus areas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="focus">Focus Areas</TabsTrigger>
          <TabsTrigger value="milestones">Next Milestones</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        {/* Focus Areas Tab */}
        <TabsContent value="focus" className="space-y-4 pt-2">
          {priorityFocus && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Priority Focus: {priorityFocus.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{priorityFocus.description}</p>
                {priorityFocus.progress !== null && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{priorityFocus.progress}%</span>
                    </div>
                    <Progress value={priorityFocus.progress} className="h-2" />
                  </div>
                )}
                <div className="flex space-x-2 mt-2">
                  {priorityFocus.actions.map((action, i) => (
                    <Button key={i} size="sm" variant={i === 0 ? "default" : "outline"}>
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Other focus areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {focusAreas
              .filter(area => area !== priorityFocus)
              .map((area) => (
                <Card key={area.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      {area.priority === 'medium' ? (
                        <Target className="w-4 h-4 mr-2 text-amber-500" />
                      ) : (
                        <Lightbulb className="w-4 h-4 mr-2 text-green-500" />
                      )}
                      {area.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{area.description}</p>
                    {area.progress !== null && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{area.progress}%</span>
                        </div>
                        <Progress value={area.progress} className="h-1" />
                      </div>
                    )}
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        {area.actions[0].label}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4 pt-2">
          {nextMilestones.length > 0 ? (
            <div className="space-y-4">
              {nextMilestones.map((milestone) => (
                <Card key={milestone.milestone_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start">
                        <Award className="w-5 h-5 text-amber-500 mr-2 mt-1" />
                        <div>
                          <div className="font-semibold text-lg text-gray-900">
                            Milestone: {milestone.milestone_id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Completed: {milestone.completed_at ? new Date(milestone.completed_at).toLocaleDateString() : 'Not yet'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Additional milestone details can be rendered here if available */}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No milestones available</p>
              <p className="text-sm">You've completed all current milestones!</p>
            </div>
          )}
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="pt-2">
          <Tabs defaultValue="content">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
            </TabsList>
            
            {/* Content recommendations */}
            <TabsContent value="content" className="space-y-3 pt-2">
              {contentRecommendations.map((content) => (
                <div 
                  key={content.id}
                  className="flex items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{content.title}</h4>
                    <p className="text-xs text-muted-foreground">{content.type}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
            
            {/* Feature recommendations */}
            <TabsContent value="features" className="space-y-3 pt-2">
              {featureRecommendations.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-xs text-muted-foreground">{feature.reason}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
            
            {/* Learning path recommendations */}
            <TabsContent value="learning" className="space-y-3 pt-2">
              {learningPathRecommendations.map((path) => (
                <Card key={path.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{path.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {path.modules} modules · {path.estimatedTime}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{path.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      View learning path
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
