"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { superpuzzlesService } from '../src/superpuzzles';
import { useToast } from './useToast';

/**
 * Hook for managing superpuzzles functionality
 * Provides methods for contributing to and tracking superpuzzles
 */
export const useSuperpuzzles = () => {
  const user = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeSuperpuzzles, setActiveSuperpuzzles] = useState<any[]>([]);
  const [todaySuperpuzzles, setTodaySuperpuzzles] = useState<any[]>([]);
  const [selectedSuperpuzzle, setSelectedSuperpuzzle] = useState<any | null>(null);
  const [teamContributions, setTeamContributions] = useState<any[]>([]);
  const [userContributions, setUserContributions] = useState<any[]>([]);

  // Load all active superpuzzles
  const loadActiveSuperpuzzles = async () => {
    setLoading(true);
    try {
      const result = await superpuzzlesService.getActiveSuperpuzzles();
      if (result.success && result.data) {
        setActiveSuperpuzzles(result.data);
      } else {
        console.error('Failed to load superpuzzles:', result.error);
      }
    } catch (error) {
      console.error('Error loading superpuzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load superpuzzles for today
  const loadTodaySuperpuzzles = async () => {
    setLoading(true);
    try {
      // Get current day of week (0 = Sunday, 1 = Monday, etc.)
      const dayIndex = new Date().getDay();
      const result = await superpuzzlesService.getSuperpuzzlesByDay(dayIndex);
      
      if (result.success && result.data) {
        setTodaySuperpuzzles(result.data);
      } else {
        console.error('Failed to load today\'s superpuzzles:', result.error);
      }
    } catch (error) {
      console.error('Error loading today\'s superpuzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load superpuzzle details
  const loadSuperpuzzleDetails = async (superpuzzleId: string) => {
    setLoading(true);
    try {
      const result = await superpuzzlesService.getSuperpuzzleDetails(superpuzzleId);
      if (result.success && result.data) {
        setSelectedSuperpuzzle(result.data);
        return result.data;
      } else {
        console.error('Failed to load superpuzzle details:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error loading superpuzzle details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if a user can contribute to a superpuzzle
  const checkContributionEligibility = async (teamId: string, superpuzzleId: string) => {
    if (!user) {
      return { isEligible: false, reason: 'You must be logged in to contribute' };
    }
    
    try {
      const result = await superpuzzlesService.checkContributionEligibility(
        user.id, teamId, superpuzzleId
      );
      
      if (result.success && result.data) {
        return result.data;
      } else {
        return { isEligible: false, reason: result.error || 'Failed to check eligibility' };
      }
    } catch (error) {
      console.error('Error checking contribution eligibility:', error);
      return { isEligible: false, reason: 'An error occurred while checking eligibility' };
    }
  };

  // Contribute to a superpuzzle
  const contributeToSuperpuzzle = async (teamId: string, superpuzzleId: string, points: number) => {
    if (!user) {
      showToast('error', 'You must be logged in to contribute');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await superpuzzlesService.contributeToSuperpuzzle(
        user.id, teamId, superpuzzleId, points
      );
      
      if (result.success && result.data) {
        showToast('success', 'Contribution recorded successfully!');
        
        // Check if superpuzzle was completed
        if (result.data.unlockedSCQ) {
          showToast('success', 'SCQ token unlocked! 🎉');
        }
        
        if (result.data.unlockedSubTokens && result.data.unlockedSubTokens.length > 0) {
          showToast('success', `Sub-tokens unlocked: ${result.data.unlockedSubTokens.map((t: any) => t.symbol).join(', ')} 🎉`);
        }
        
        // Refresh data
        await loadTeamContributions(teamId);
        await loadUserContributions();
        if (selectedSuperpuzzle) {
          await loadSuperpuzzleDetails(selectedSuperpuzzle.id);
        }
        
        return { success: true, data: result.data };
      } else {
        showToast('error', result.error || 'Failed to contribute to superpuzzle');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error contributing to superpuzzle:', error);
      showToast('error', 'An error occurred while contributing');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Load a team's contributions to superpuzzles
  const loadTeamContributions = async (teamId: string) => {
    setLoading(true);
    try {
      const result = await superpuzzlesService.getTeamContributions(teamId);
      if (result.success && result.data) {
        setTeamContributions(result.data);
        return result.data;
      } else {
        console.error('Failed to load team contributions:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error loading team contributions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load a user's contributions to superpuzzles
  const loadUserContributions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await superpuzzlesService.getUserContributions(user.id);
      if (result.success && result.data) {
        setUserContributions(result.data);
      } else {
        console.error('Failed to load user contributions:', result.error);
      }
    } catch (error) {
      console.error('Error loading user contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if a sub-token is eligible to be unlocked
  const checkSubTokenUnlockEligibility = async (tokenSymbol: string) => {
    try {
      const result = await superpuzzlesService.checkSubTokenUnlockEligibility(tokenSymbol);
      if (result.success && result.data) {
        return result.data;
      } else {
        return {
          isEligible: false,
          tokenSymbol,
          totalPoints: 0,
          requiredPoints: 0,
          progress: 0,
          reason: result.error || 'Failed to check eligibility'
        };
      }
    } catch (error) {
      console.error('Error checking sub-token unlock eligibility:', error);
      return {
        isEligible: false,
        tokenSymbol,
        totalPoints: 0,
        requiredPoints: 0,
        progress: 0,
        reason: 'An error occurred while checking eligibility'
      };
    }
  };

  // Unlock a sub-token
  const unlockSubToken = async (tokenSymbol: string) => {
    setLoading(true);
    try {
      const result = await superpuzzlesService.unlockSubToken(tokenSymbol);
      if (result.success) {
        showToast('success', `${tokenSymbol} token unlocked successfully! 🎉`);
        return { success: true };
      } else {
        showToast('error', result.error || 'Failed to unlock token');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error unlocking sub-token:', error);
      showToast('error', 'An error occurred while unlocking the token');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Get the token color for a day of the week
  const getTokenColorForDay = (dayIndex: number) => {
    const tokenColors = {
      0: 'from-red-500 via-green-500 to-blue-500', // Sunday: SPD (Red-Green-Blue)
      1: 'from-rose-500 via-red-500 to-orange-500', // Monday: SHE (Rose-Red-Orange)
      2: 'from-amber-500 to-yellow-500', // Tuesday: PSP (Amber-Yellow)
      3: 'from-lime-500 via-green-500 to-emerald-500', // Wednesday: SSA (Lime-Green-Emerald)
      4: 'from-teal-500 to-cyan-500', // Thursday: BSP (Teal-Cyan)
      5: 'from-sky-500 via-blue-500 to-indigo-500', // Friday: SGB (Sky-Blue-Indigo)
      6: 'from-violet-500 via-purple-500 to-fuchsia-500 to-pink-500', // Saturday: SMS (Violet-Purple-Fuchsia-Pink)
    };
    
    return tokenColors[dayIndex as keyof typeof tokenColors] || 'from-gray-500 to-gray-700';
  };

  // Get the token name for a day of the week
  const getTokenNameForDay = (dayIndex: number) => {
    const tokenNames = {
      0: 'Superpuzzle Developments (SPD)', // Sunday
      1: 'Superhuman Enhancements (SHE)', // Monday
      2: 'Personal Success Puzzle (PSP)', // Tuesday
      3: 'Supersociety Advancements (SSA)', // Wednesday
      4: 'Business Success Puzzle (BSP)', // Thursday
      5: 'Supergenius Breakthroughs (SGB)', // Friday
      6: 'Supermind Superpowers (SMS)', // Saturday
    };
    
    return tokenNames[dayIndex as keyof typeof tokenNames] || 'Unknown Token';
  };

  // Load initial data
  useEffect(() => {
    loadActiveSuperpuzzles();
    loadTodaySuperpuzzles();
    
    if (user) {
      loadUserContributions();
    } else {
      setUserContributions([]);
    }
  }, [user]);

  return {
    loading,
    activeSuperpuzzles,
    todaySuperpuzzles,
    selectedSuperpuzzle,
    teamContributions,
    userContributions,
    loadActiveSuperpuzzles,
    loadTodaySuperpuzzles,
    loadSuperpuzzleDetails,
    checkContributionEligibility,
    contributeToSuperpuzzle,
    loadTeamContributions,
    loadUserContributions,
    checkSubTokenUnlockEligibility,
    unlockSubToken,
    getTokenColorForDay,
    getTokenNameForDay,
    setSelectedSuperpuzzle
  };
};

export default useSuperpuzzles;
