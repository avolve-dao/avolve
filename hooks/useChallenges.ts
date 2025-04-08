import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { challengesService } from '../src/challenges';
import { metricsService } from '../src/metrics';
import { TokenSymbol } from '../types/supabase';

/**
 * Hook for managing user challenges and progress
 * Handles challenge completion, progress tracking, and token unlocking
 */
export function useChallenges() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayChallenges, setTodayChallenges] = useState<{
    dayToken: string;
    challenges: any[];
    completedToday: any[];
  } | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<any[]>([]);

  // Load today's challenges and user progress
  const loadChallengeData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get today's challenges
      const todayResult = await challengesService.getTodaysChallenges(user.id);
      
      if (todayResult.success && todayResult.data) {
        setTodayChallenges(todayResult.data);
      }
      
      // Get user progress
      const progressResult = await challengesService.getUserProgress(user.id);
      
      if (progressResult.success && progressResult.data) {
        setUserProgress(progressResult.data || []);
      }
      
      // Get completed challenges
      const completedResult = await challengesService.getUserCompletedChallenges(user.id);
      
      if (completedResult.success && completedResult.data) {
        setCompletedChallenges(completedResult.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge data');
      console.error('Load challenge data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Complete a challenge
  const completeChallenge = useCallback(async (challengeId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await challengesService.completeChallenge(user.id, challengeId);
      
      if (result.success) {
        // Record interaction metric
        await metricsService.recordInteraction(
          user.id,
          challengeId,
          'challenge_completed'
        );
        
        // Record time spent (10 minutes for completing a challenge)
        await metricsService.recordTimeSpent(user.id, 10, 'challenge');
        
        // Refresh challenge data
        await loadChallengeData();
        
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Challenge completion failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Challenge completion failed';
      setError(errorMsg);
      console.error('Challenge completion error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user, loadChallengeData]);

  // Get challenges for a specific token
  const getChallengesForToken = useCallback(async (tokenSymbol: TokenSymbol) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const result = await challengesService.getChallenges(tokenSymbol);
      return result;
    } catch (err) {
      console.error('Get challenges for token error:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to get challenges' 
      };
    }
  }, [user]);

  // Check if a challenge has been completed today
  const isChallengeCompletedToday = useCallback((challengeId: string): boolean => {
    if (!todayChallenges || !todayChallenges.completedToday) return false;
    
    return todayChallenges.completedToday.some(
      challenge => challenge.challenge_id === challengeId
    );
  }, [todayChallenges]);

  // Get progress for a specific token
  const getProgressForToken = useCallback((tokenSymbol: TokenSymbol) => {
    const progress = userProgress.find(p => p.tokens?.symbol === tokenSymbol);
    return progress || { points: 0, level: 0, tokens: { is_locked: true } };
  }, [userProgress]);

  // Load challenge data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadChallengeData();
    } else {
      setTodayChallenges(null);
      setUserProgress([]);
      setCompletedChallenges([]);
    }
  }, [user, loadChallengeData]);

  return {
    loading,
    error,
    todayChallenges,
    userProgress,
    completedChallenges,
    completeChallenge,
    getChallengesForToken,
    isChallengeCompletedToday,
    getProgressForToken,
    refreshChallengeData: loadChallengeData
  };
}

export default useChallenges;
