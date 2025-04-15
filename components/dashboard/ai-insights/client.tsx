'use client';

/**
 * AI Insights Client Component
 * 
 * Client-side interactive component for displaying AI-powered insights and predictions
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Zap, 
  Brain, 
  Award, 
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// UI components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

// Types
import type { PhaseId } from '@/types/experience';

interface TokenPrediction {
  target: number;
  daysToTarget: number;
}

interface FeatureRecommendation {
  id: string;
  name: string;
  reason: string;
}

interface AIInsightsClientProps {
  currentPhase: PhaseId;
  regenScore: number;
  regenLevel: number;
  daysToNextLevel: number | null;
  phaseCompletionPredictions: Record<string, string>;
  tokenPredictions: Record<string, TokenPrediction>;
  tokenEarningRates: Record<string, number>;
  tokenBalances: Record<string, number>;
  recommendations: FeatureRecommendation[];
}

export function AIInsightsClient({
  currentPhase,
  regenScore,
  regenLevel,
  daysToNextLevel,
  phaseCompletionPredictions,
  tokenPredictions,
  tokenEarningRates,
  tokenBalances,
  recommendations
}: AIInsightsClientProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format days into a human-readable string
  const formatDays = (days: number) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.round(days / 7)} weeks`;
    if (days === 30) return '1 month';
    return `${Math.round(days / 30)} months`;
  };
  
  // Get the most relevant prediction to highlight
  const getHighlightedPrediction = () => {
    // Prioritize regen level if available
    if (daysToNextLevel && daysToNextLevel < 30) {
      return {
        title: `Regen Level ${regenLevel + 1} in ${formatDays(daysToNextLevel)}`,
        icon: <Award className="w-5 h-5 text-purple-500" />,
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      };
    }
    
    // Next, check phase completion predictions
    const currentPhaseCompletion = phaseCompletionPredictions[currentPhase];
    if (currentPhaseCompletion && currentPhaseCompletion !== 'Insufficient data') {
      const daysToCompletion = Math.round((new Date(currentPhaseCompletion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysToCompletion > 0 && daysToCompletion < 60) {
        return {
          title: `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} phase completion in ${formatDays(daysToCompletion)}`,
          icon: <Calendar className="w-5 h-5 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      }
    }
    
    // Next, check token predictions
    const tokenPredictionEntries = Object.entries(tokenPredictions);
    if (tokenPredictionEntries.length > 0) {
      // Sort by days to target (ascending)
      tokenPredictionEntries.sort((a, b) => a[1].daysToTarget - b[1].daysToTarget);
      const [symbol, prediction] = tokenPredictionEntries[0];
      
      const tokenColors: Record<string, string> = {
        SAP: 'bg-amber-100 text-amber-800 border-amber-300',
        SCQ: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        GEN: 'bg-zinc-100 text-zinc-800 border-zinc-300'
      };
      
      const tokenIcons: Record<string, React.ReactNode> = {
        SAP: <Zap className="w-5 h-5 text-amber-500" />,
        SCQ: <TrendingUp className="w-5 h-5 text-emerald-500" />,
        GEN: <Brain className="w-5 h-5 text-zinc-500" />
      };
      
      return {
        title: `${prediction.target} ${symbol} tokens in ${formatDays(prediction.daysToTarget)}`,
        icon: tokenIcons[symbol] || <Sparkles className="w-5 h-5 text-blue-500" />,
        color: tokenColors[symbol] || 'bg-blue-100 text-blue-800 border-blue-300'
      };
    }
    
    // Default prediction
    return {
      title: 'AI insights powered by Avolve',
      icon: <Sparkles className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    };
  };
  
  const highlightedPrediction = getHighlightedPrediction();
  
  // Get token earning insights
  const getTokenEarningInsights = () => {
    return Object.entries(tokenEarningRates)
      .filter(([_, rate]) => rate > 0)
      .map(([symbol, rate]) => ({
        symbol,
        rate,
        balance: tokenBalances[symbol] || 0
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);
  };
  
  const tokenInsights = getTokenEarningInsights();
  
  return (
    <div className="space-y-4">
      {/* Main insight card */}
      <Card className={`border ${highlightedPrediction.color.split(' ')[2]} hover:shadow-md transition-shadow`}>
        <CardContent className="pt-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${highlightedPrediction.color.split(' ')[0]}`}>
                {highlightedPrediction.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium">{highlightedPrediction.title}</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered prediction based on your activity
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Expandable details */}
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t"
            >
              {/* Regen score section */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Regen Score</span>
                  <span>{regenScore} / {(regenLevel + 1) * 500}</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={(regenScore / ((regenLevel + 1) * 500)) * 100} 
                    className="h-2" 
                  />
                  {daysToNextLevel && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="absolute top-0 right-0 h-4 w-4 -mt-1 -mr-1 bg-purple-500 rounded-full border-2 border-white"
                            style={{ 
                              left: `${(regenScore / ((regenLevel + 1) * 500)) * 100}%` 
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Level {regenLevel + 1} in ~{formatDays(daysToNextLevel)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              {/* Token earning rates */}
              {tokenInsights.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Token Earning Rates (weekly)</h4>
                  <div className="space-y-2">
                    {tokenInsights.map(insight => (
                      <div key={insight.symbol} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={
                              insight.symbol === 'SAP' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              insight.symbol === 'SCQ' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }
                          >
                            {insight.symbol}
                          </Badge>
                          <span className="ml-2">{insight.rate} / week</span>
                        </div>
                        <span className="text-muted-foreground">Balance: {insight.balance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommended Next Steps</h4>
                  <div className="space-y-2">
                    {recommendations.map(rec => (
                      <div 
                        key={rec.id}
                        className="flex items-center justify-between text-sm p-2 rounded border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                          <span>{rec.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {/* Additional insights in a grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Phase completion prediction */}
        {phaseCompletionPredictions[currentPhase] && phaseCompletionPredictions[currentPhase] !== 'Insufficient data' && (
          <Card className="border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Phase Completion</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(phaseCompletionPredictions[currentPhase]).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Token prediction */}
        {Object.entries(tokenPredictions).length > 0 && (
          <Card className="border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Token Milestone</h4>
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(tokenPredictions)
                      .sort((a, b) => a[1].daysToTarget - b[1].daysToTarget)
                      .slice(0, 1)
                      .map(([symbol, pred]) => `${pred.target} ${symbol} in ${formatDays(pred.daysToTarget)}`)
                      .join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
