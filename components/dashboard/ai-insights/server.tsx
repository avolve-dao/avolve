/**
 * AI Insights Server Component
 * 
 * Displays AI-powered insights and predictions about user progress
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AIInsightsClient } from './client';

// Types
import type { Database } from '@/types/supabase';

// Analytics for predictions
import { calculatePredictedCompletionDates } from '@/components/dashboard/journey-map/server';
import { getPersonalizedRecommendations } from '@/lib/analytics/server';

export async function AIInsightsServer({ userId }: { userId: string }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch user's current phase and progress
  const { data: userProgress } = await supabase.rpc('get_user_progress', {
    user_id_param: userId
  });
  
  // Fetch user's token balances
  const { data: tokenBalances } = await supabase
    .from('user_balances')
    .select('token_id, balance')
    .eq('user_id', userId);
  
  // Fetch token metadata
  const { data: tokens } = await supabase
    .from('tokens')
    .select('id, symbol, name');
  
  // Create a map of token symbols to balances
  const tokenBalanceMap: Record<string, number> = {};
  
  if (tokenBalances && tokens) {
    tokenBalances.forEach(balance => {
      const token = tokens.find(t => t.id === balance.token_id);
      if (token) {
        tokenBalanceMap[token.symbol] = balance.balance;
      }
    });
  }
  
  // Fetch user's completed milestones
  const { data: completedMilestones } = await supabase
    .from('user_phase_milestones')
    .select('milestone_id, completed_at')
    .eq('user_id', userId)
    .order('completed_at');
  
  // Fetch phase transitions for journey history
  const { data: phaseTransitions } = await supabase
    .from('user_phase_transitions')
    .select('from_phase, to_phase, transitioned_at')
    .eq('user_id', userId)
    .order('transitioned_at');
  
  // Fetch all experience phases for reference
  const { data: phases } = await supabase
    .from('experience_phases')
    .select('*')
    .order('sequence');
  
  // Calculate progress percentage for each phase
  const phaseProgress = phases?.map(phase => {
    const phaseMilestones = completedMilestones?.filter(
      milestone => milestone.milestone_id.startsWith(`${phase.id}_`)
    ) || [];
    
    // Get total milestones for this phase from the phase requirements
    const totalMilestones = phase.requirements?.milestones?.length || 0;
    const completedCount = phaseMilestones.length;
    
    return {
      phaseId: phase.id,
      phaseName: phase.name,
      description: phase.description,
      sequence: phase.sequence,
      completed: completedCount === totalMilestones && totalMilestones > 0,
      progress: totalMilestones > 0 
        ? Math.round((completedCount / totalMilestones) * 100) 
        : 0,
      completedMilestones: phaseMilestones.map(m => m.milestone_id),
      isCurrentPhase: userProgress?.current_phase === phase.id
    };
  }) || [];
  
  // Calculate AI-based predictions for phase completion
  const predictedCompletionDates = await calculatePredictedCompletionDates(
    userId,
    phaseProgress,
    completedMilestones || []
  );
  
  // Get personalized recommendations
  const recommendations = await getPersonalizedRecommendations(userId);
  
  // Fetch user's regen score from analytics view
  const { data: regenAnalytics } = await supabase
    .from('regen_analytics_mv')
    .select('user_id, regen_score, regen_level, next_level_threshold')
    .eq('user_id', userId)
    .single();
  
  // Calculate days to next regen level
  let daysToNextLevel = null;
  
  if (regenAnalytics && regenAnalytics.regen_score && regenAnalytics.next_level_threshold) {
    const scoreGap = regenAnalytics.next_level_threshold - regenAnalytics.regen_score;
    const averageScorePerDay = 10; // This would be calculated from historical data in a real implementation
    daysToNextLevel = Math.ceil(scoreGap / averageScorePerDay);
  }
  
  // Fetch user's token transaction history
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('token_id, amount, created_at, transaction_type, to_user_id, from_user_id')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Calculate token earning rate (tokens per week)
  const tokenEarningRates: Record<string, number> = {};
  
  if (recentTransactions && tokens) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTransactions = recentTransactions.filter(
      tx => new Date(tx.created_at) >= oneWeekAgo && tx.to_user_id === userId
    );
    
    // Group by token
    const tokenTotals: Record<string, number> = {};
    
    weeklyTransactions.forEach(tx => {
      const token = tokens.find(t => t.id === tx.token_id);
      if (token) {
        if (!tokenTotals[token.symbol]) {
          tokenTotals[token.symbol] = 0;
        }
        tokenTotals[token.symbol] += tx.amount;
      }
    });
    
    // Calculate weekly rates
    Object.entries(tokenTotals).forEach(([symbol, total]) => {
      tokenEarningRates[symbol] = total;
    });
  }
  
  // Predict when user will reach token thresholds
  const tokenPredictions: Record<string, { target: number, daysToTarget: number }> = {};
  
  // Define token thresholds based on current phase
  const tokenThresholds: Record<string, number> = {
    SAP: userProgress?.current_phase === 'discovery' ? 50 : 
         userProgress?.current_phase === 'onboarding' ? 200 : 
         userProgress?.current_phase === 'scaffolding' ? 500 : 1000,
    SCQ: userProgress?.current_phase === 'discovery' ? 10 : 
         userProgress?.current_phase === 'onboarding' ? 50 : 
         userProgress?.current_phase === 'scaffolding' ? 200 : 500,
    GEN: userProgress?.current_phase === 'discovery' ? 5 : 
         userProgress?.current_phase === 'onboarding' ? 20 : 
         userProgress?.current_phase === 'scaffolding' ? 50 : 200
  };
  
  // Calculate days to reach thresholds
  Object.entries(tokenThresholds).forEach(([symbol, threshold]) => {
    const currentBalance = tokenBalanceMap[symbol] || 0;
    const weeklyRate = tokenEarningRates[symbol] || 0;
    
    if (currentBalance < threshold && weeklyRate > 0) {
      const remaining = threshold - currentBalance;
      const daysToTarget = Math.ceil((remaining / weeklyRate) * 7);
      
      tokenPredictions[symbol] = {
        target: threshold,
        daysToTarget
      };
    }
  });
  
  return (
    <AIInsightsClient 
      currentPhase={userProgress?.current_phase || 'discovery'}
      regenScore={regenAnalytics?.regen_score || 0}
      regenLevel={regenAnalytics?.regen_level || 1}
      daysToNextLevel={daysToNextLevel}
      phaseCompletionPredictions={predictedCompletionDates}
      tokenPredictions={tokenPredictions}
      tokenEarningRates={tokenEarningRates}
      tokenBalances={tokenBalanceMap}
      recommendations={recommendations.features.slice(0, 3)}
    />
  );
}
