'use client';

/**
 * Journey Map Client Component
 * 
 * Client-side interactive component for displaying user journey through experience phases
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Award, Clock } from 'lucide-react';

// UI components
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

// Types
import type { PhaseProgress, PhaseTransition } from '@/types/experience';

interface JourneyMapClientProps {
  phaseProgress: PhaseProgress[];
  currentPhase: string;
  phaseTransitions: PhaseTransition[];
  predictedCompletionDates: Record<string, string>;
}

export function JourneyMapClient({
  phaseProgress,
  currentPhase,
  phaseTransitions,
  predictedCompletionDates
}: JourneyMapClientProps) {
  const [selectedPhase, setSelectedPhase] = useState<string>(currentPhase);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort phases by sequence
  const sortedPhases = [...phaseProgress].sort((a, b) => a.sequence - b.sequence);
  
  // Get details of selected phase
  const phaseDetails = phaseProgress.find(p => p.phaseId === selectedPhase);
  
  // Format transition dates for display
  const formatTransitionDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      {/* Journey progress visualization */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        {sortedPhases.map((phase, index) => (
          <div key={phase.phaseId} className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={phase.phaseId === selectedPhase ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full px-4 ${
                      phase.completed ? "bg-green-100 border-green-500 text-green-700" : 
                      phase.isCurrentPhase ? "bg-blue-100 border-blue-500 text-blue-700" : ""
                    }`}
                    onClick={() => setSelectedPhase(phase.phaseId)}
                  >
                    {phase.completed && <Award className="w-4 h-4 mr-1" />}
                    {phase.phaseName}
                    <span className="ml-2 text-xs font-normal">
                      {phase.progress}%
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{phase.description}</p>
                  {phase.completed ? (
                    <p className="text-green-600 text-xs mt-1">Completed!</p>
                  ) : predictedCompletionDates[phase.phaseId] ? (
                    <p className="text-xs mt-1">
                      Predicted completion: {predictedCompletionDates[phase.phaseId]}
                    </p>
                  ) : null}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {index < sortedPhases.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
      
      {/* Selected phase details */}
      {phaseDetails && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">{phaseDetails.phaseName} Phase</h3>
                <p className="text-muted-foreground">{phaseDetails.description}</p>
              </div>
              
              {!phaseDetails.completed && predictedCompletionDates[phaseDetails.phaseId] && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  Predicted completion: {predictedCompletionDates[phaseDetails.phaseId]}
                </div>
              )}
            </div>
            
            <Progress value={phaseDetails.progress} className="h-2 mb-4" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {phaseDetails.progress}%</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Show details"}
              </Button>
            </div>
            
            {/* Expandable journey history */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t"
              >
                <h4 className="text-sm font-medium mb-2">Journey History</h4>
                <div className="space-y-2">
                  {phaseTransitions
                    .filter(t => t.to_phase === phaseDetails.phaseId || t.from_phase === phaseDetails.phaseId)
                    .map((transition, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>
                          {transition.from_phase === phaseDetails.phaseId 
                            ? `Progressed to ${transition.to_phase} phase` 
                            : `Started ${phaseDetails.phaseName} phase`
                          } on {formatTransitionDate(transition.transitioned_at)}
                        </span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
