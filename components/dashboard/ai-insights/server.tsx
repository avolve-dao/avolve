/**
 * AI Insights Server Component
 *
 * Displays AI-powered insights and predictions about user progress
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AIInsightsClient } from './client';

// Types
import type { Database } from '@/types/supabase';
import type { PhaseId } from '@/types/experience';

// Analytics for predictions
import { calculatePredictedCompletionDates } from '@/components/dashboard/journey-map/server';
import { getPersonalizedRecommendations } from '@/lib/analytics/server';

// Type guard for current_phase object
function isCurrentPhaseObj(val: unknown): val is { current_phase?: string } {
  return typeof val === 'object' && val !== null && 'current_phase' in val;
}

function isPhaseId(val: any): val is PhaseId {
  return ['discovery', 'onboarding', 'scaffolding', 'endgame'].includes(val);
}

export async function AIInsightsServer({ userId }: { userId: string }) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch user's current phase
  const { data: phaseDataRaw } = await supabase.rpc('get_user_progress', {
    p_user_id: userId,
  });
  // Defensive: handle both array (legacy) and object (current)
  const phaseData = Array.isArray(phaseDataRaw) ? phaseDataRaw[0] : phaseDataRaw;
  const currentPhase = isCurrentPhaseObj(phaseData) ? phaseData.current_phase : undefined;
  const safePhase: PhaseId = isPhaseId(currentPhase) ? currentPhase : 'discovery';

  // Fetch user's token balances
  const { data: tokenBalances } = await supabase
    .from('user_balances')
    .select('token_id, balance')
    .eq('user_id', userId);

  // Fetch token metadata
  const { data: tokens } = await supabase.from('tokens').select('id, symbol, name');

  // Create a map of token symbols to balances
  const tokenBalanceMap: Record<string, number> = {};

  if (tokenBalances && tokens) {
    tokenBalances.forEach((balance: { token_id: string; balance: number }) => {
      const token = tokens.find((t: { id: string }) => t.id === balance.token_id);
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
  const { data: phases } = await supabase.from('experience_phases').select('*').order('sequence');

  // Calculate progress percentage for each phase
  const phaseProgress =
    phases?.map(
      (phase: {
        id: string;
        name: string;
        description: string;
        sequence: number;
        requirements: any;
      }) => {
        const phaseMilestones =
          completedMilestones?.filter((milestone: { milestone_id: string }) =>
            milestone.milestone_id.startsWith(`${phase.id}_`)
          ) || [];

        // Get total milestones for this phase from the phase requirements
        const requirements = phase.requirements;
        const totalMilestones =
          requirements &&
          typeof requirements === 'object' &&
          !Array.isArray(requirements) &&
          requirements !== null &&
          'milestones' in requirements &&
          Array.isArray((requirements as any).milestones)
            ? (requirements as any).milestones.length
            : 0;
        const completedCount = phaseMilestones.length;

        return {
          phaseId: phase.id,
          phaseName: phase.name,
          description: phase.description,
          sequence: phase.sequence,
          completed: completedCount === totalMilestones && totalMilestones > 0,
          progress: totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0,
          completedMilestones: phaseMilestones.map((m: { milestone_id: string }) => m.milestone_id),
          isCurrentPhase: safePhase === phase.id,
        };
      }
    ) || [];

  // Calculate AI-based predictions for phase completion
  const predictedCompletionDates = await calculatePredictedCompletionDates(
    userId,
    phaseProgress,
    completedMilestones || []
  );

  // Get personalized recommendations
  const recommendations = await getPersonalizedRecommendations(userId);

  // --- Remove broken analytics queries (regen_analytics_mv, transactions) and mock analytics for now ---

  // Mock regen analytics (replace with real analytics when available)
  const regenAnalytics = {
    regen_score: 0,
    regen_level: 1,
    next_level_threshold: 100,
  };
  const daysToNextLevel = null; // Replace with real calculation if/when available

  // --- End of analytics stub ---

  // Fetch user's token transaction history for analytics
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
      (tx: { created_at: string; to_user_id: string }) =>
        new Date(tx.created_at) >= oneWeekAgo && tx.to_user_id === userId
    );
    // Group by token
    const tokenTotals: Record<string, number> = {};
    weeklyTransactions.forEach((tx: { token_id: string; amount: number }) => {
      const token = tokens.find((t: { id: string }) => t.id === tx.token_id);
      if (token) {
        if (!tokenTotals[token.symbol]) {
          tokenTotals[token.symbol] = 0;
        }
        tokenTotals[token.symbol] += Number(tx.amount);
      }
    });
    // Calculate weekly rates
    Object.entries(tokenTotals).forEach(([symbol, total]) => {
      tokenEarningRates[symbol] = total;
    });
  }

  // Predict when user will reach token thresholds
  const tokenPredictions: Record<string, { target: number; daysToTarget: number }> = {};

  // Define token thresholds based on current phase
  const tokenThresholds: Record<string, number> = {
    SAP:
      safePhase === 'discovery'
        ? 50
        : safePhase === 'onboarding'
          ? 200
          : safePhase === 'scaffolding'
            ? 500
            : 1000,
    SCQ:
      safePhase === 'discovery'
        ? 10
        : safePhase === 'onboarding'
          ? 50
          : safePhase === 'scaffolding'
            ? 200
            : 500,
    GEN:
      safePhase === 'discovery'
        ? 5
        : safePhase === 'onboarding'
          ? 20
          : safePhase === 'scaffolding'
            ? 50
            : 200,
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
        daysToTarget,
      };
    }
  });

  return (
    <AIInsightsClient
      currentPhase={safePhase}
      regenScore={regenAnalytics.regen_score}
      regenLevel={regenAnalytics.regen_level}
      daysToNextLevel={daysToNextLevel}
      phaseCompletionPredictions={predictedCompletionDates}
      tokenPredictions={tokenPredictions}
      tokenEarningRates={tokenEarningRates}
      tokenBalances={tokenBalanceMap}
      recommendations={recommendations.features.slice(0, 3)}
    />
  );
}
