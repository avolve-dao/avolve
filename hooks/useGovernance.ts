import { useState, useEffect } from 'react';
import { governanceService } from '../src/governance';
import { tokensService } from '../src/tokens';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for managing governance functionality
 * Provides methods for creating petitions, voting, and viewing petition data
 */
export const useGovernance = () => {
  // For now, always use a fallback userId string (anonymous or a test value)
  const userId = 'anonymous';
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    genBalance: number;
    requiredGen: number;
    reason?: string;
  } | null>(null);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [userPetitions, setUserPetitions] = useState<any[]>([]);
  const [selectedPetition, setSelectedPetition] = useState<any | null>(null);
  const [userVote, setUserVote] = useState<{
    hasVoted: boolean;
    voteWeight?: number;
    voteId?: string;
  } | null>(null);

  // Check petition creation eligibility
  const checkEligibility = async () => {
    setEligibilityLoading(true);
    try {
      const result = await governanceService.checkPetitionEligibility(userId);
      if (result.success && result.data) {
        setEligibility(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to check eligibility',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while checking eligibility',
        variant: 'destructive',
      });
    } finally {
      setEligibilityLoading(false);
    }
  };

  // Create a new petition
  const createPetition = async (title: string, description: string) => {
    setLoading(true);
    try {
      const result = await governanceService.createPetition(userId, title, description);
      if (result.success && result.data) {
        toast({
          title: 'Success',
          description: 'Petition created successfully!',
          // shadcn/ui only supports 'default' or 'destructive' for variant
          variant: 'default',
        });
        await loadUserPetitions();
        return { success: true, petitionId: result.data.petitionId };
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create petition',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error creating petition:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the petition',
        variant: 'destructive',
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Vote on a petition
  const voteOnPetition = async (petitionId: string) => {
    setLoading(true);
    try {
      const result = await governanceService.voteOnPetition(userId, petitionId);
      if (result.success && result.data) {
        toast({
          title: 'Success',
          description: result.data.message,
          // shadcn/ui only supports 'default' or 'destructive' for variant
          variant: 'default',
        });
        
        // Refresh petition details if we're viewing this petition
        if (selectedPetition && selectedPetition.id === petitionId) {
          await loadPetitionDetails(petitionId);
        }
        
        await checkUserVote(petitionId);
        return { success: true, voteWeight: result.data.voteWeight };
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to vote on petition',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error voting on petition:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while voting',
        variant: 'destructive',
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Process a petition (approve or reject)
  const processPetition = async (petitionId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const result = await governanceService.processPetition(petitionId, status);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Petition ${status} successfully!`,
          // shadcn/ui only supports 'default' or 'destructive' for variant
          variant: 'default',
        });
        
        // Refresh petition details
        if (selectedPetition && selectedPetition.id === petitionId) {
          await loadPetitionDetails(petitionId);
        }
        
        await loadPetitions();
        return { success: true };
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to ${status} petition`,
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`Error ${status} petition:`, error);
      toast({
        title: 'Error',
        description: `An error occurred while ${status === 'approved' ? 'approving' : 'rejecting'} the petition`,
        variant: 'destructive',
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Load all petitions
  const loadPetitions = async (status?: 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const result = await governanceService.getAllPetitions(status);
      if (result.success && result.data) {
        setPetitions(result.data);
      } else {
        console.error('Failed to load petitions:', result.error);
      }
    } catch (error) {
      console.error('Error loading petitions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load petitions created by the user
  const loadUserPetitions = async () => {
    setLoading(true);
    try {
      const result = await governanceService.getUserPetitions(userId);
      if (result.success && result.data) {
        setUserPetitions(result.data);
      } else {
        console.error('Failed to load user petitions:', result.error);
      }
    } catch (error) {
      console.error('Error loading user petitions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load petition details
  const loadPetitionDetails = async (petitionId: string) => {
    setLoading(true);
    try {
      const result = await governanceService.getPetitionDetails(petitionId);
      if (result.success && result.data) {
        setSelectedPetition(result.data);
        return result.data;
      } else {
        console.error('Failed to load petition details:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error loading petition details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has voted on a petition
  const checkUserVote = async (petitionId: string) => {
    try {
      const result = await governanceService.getUserVote(userId, petitionId);
      if (result.success && result.data) {
        setUserVote(result.data);
        return result.data;
      } else {
        console.error('Failed to check user vote:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error checking user vote:', error);
      return null;
    }
  };

  // Load initial data when user changes
  useEffect(() => {
    checkEligibility();
    loadUserPetitions();
    loadPetitions();
  }, []);

  // Check user vote when petition changes
  useEffect(() => {
    if (selectedPetition) {
      checkUserVote(selectedPetition.id);
    } else {
      setUserVote(null);
    }
  }, [selectedPetition]);

  return {
    loading,
    eligibilityLoading,
    eligibility,
    petitions,
    userPetitions,
    selectedPetition,
    userVote,
    checkEligibility,
    createPetition,
    voteOnPetition,
    processPetition,
    loadPetitions,
    loadUserPetitions,
    loadPetitionDetails,
    checkUserVote,
    setSelectedPetition
  };
};

export default useGovernance;
