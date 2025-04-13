import { useQuery, useMutation, useQueryClient, UseQueryOptions } from 'react-query';
import { GovernanceService } from '../src/governance';
import { useGovernanceFeedback } from '../components/Governance/GovernanceActionFeedback';
import { useUser } from './useUser';

// Initialize the governance service
const governanceService = new GovernanceService();

/**
 * Custom hook for governance data fetching and caching using react-query
 */
export const useGovernanceQuery = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const feedback = useGovernanceFeedback();
  const userId = user?.id;

  // Query key factories
  const queryKeys = {
    petitions: ['petitions'],
    petition: (id: string) => ['petition', id],
    eligibility: ['eligibility'],
    userVotes: ['userVotes'],
  };

  // Fetch all petitions with caching
  const usePetitions = (options?: UseQueryOptions<any, Error, any, string[]>) => {
    return useQuery(
      queryKeys.petitions,
      async () => {
        if (!userId) throw new Error('User not authenticated');
        const result = await governanceService.getAllPetitions(userId);
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch petitions');
        }
        return result.data;
      },
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        ...options,
      }
    );
  };

  // Fetch a single petition by ID with caching
  const usePetitionById = (petitionId: string, options?: UseQueryOptions<any, Error, any, string[]>) => {
    return useQuery(
      queryKeys.petition(petitionId),
      async () => {
        if (!userId) throw new Error('User not authenticated');
        if (!petitionId) throw new Error('Petition ID is required');
        
        const result = await governanceService.getPetitionById(userId, petitionId);
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch petition');
        }
        return result.data;
      },
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!userId && !!petitionId,
        ...options,
      }
    );
  };

  // Check user eligibility for governance actions with caching
  const useEligibility = (options?: UseQueryOptions<any, Error, any, string[]>) => {
    return useQuery(
      queryKeys.eligibility,
      async () => {
        if (!userId) throw new Error('User not authenticated');
        
        const result = await governanceService.checkEligibility(userId);
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to check eligibility');
        }
        return result.data;
      },
      {
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 15 * 60 * 1000, // 15 minutes
        enabled: !!userId,
        ...options,
      }
    );
  };

  // Create petition mutation with optimistic updates
  const useCreatePetition = () => {
    return useMutation(
      async ({ title, description }: { title: string; description: string }) => {
        if (!userId) throw new Error('User not authenticated');
        
        const result = await governanceService.createPetition(userId, title, description);
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to create petition');
        }
        return result.data;
      },
      {
        onSuccess: (data) => {
          // Invalidate petitions query to refresh the list
          queryClient.invalidateQueries(queryKeys.petitions);
          feedback.showSuccess('Petition created successfully!');
        },
        onError: (error: Error) => {
          feedback.showError(`Failed to create petition: ${error.message}`);
        },
      }
    );
  };

  // Vote on petition mutation with optimistic updates
  const useVotePetition = () => {
    return useMutation(
      async ({ petitionId, voteType }: { petitionId: string; voteType: 'support' | 'oppose' | 'abstain' }) => {
        if (!userId) throw new Error('User not authenticated');
        if (!petitionId) throw new Error('Petition ID is required');
        
        const result = await governanceService.voteOnPetition(userId, petitionId, voteType);
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to vote on petition');
        }
        return result.data;
      },
      {
        onMutate: async ({ petitionId, voteType }) => {
          // Cancel any outgoing refetches
          await queryClient.cancelQueries(queryKeys.petition(petitionId));
          
          // Snapshot the previous value
          const previousPetition = queryClient.getQueryData(queryKeys.petition(petitionId));
          
          // Optimistically update the petition with the new vote
          queryClient.setQueryData(queryKeys.petition(petitionId), (old: any) => {
            if (!old) return old;
            
            // Update vote counts optimistically
            const updatedPetition = { ...old };
            
            // If user already voted, adjust previous vote count
            if (updatedPetition.user_vote) {
              if (updatedPetition.user_vote === 'support') {
                updatedPetition.support_count--;
              } else if (updatedPetition.user_vote === 'oppose') {
                updatedPetition.oppose_count--;
              }
            }
            
            // Add new vote
            updatedPetition.user_vote = voteType;
            if (voteType === 'support') {
              updatedPetition.support_count++;
            } else if (voteType === 'oppose') {
              updatedPetition.oppose_count++;
            }
            
            return updatedPetition;
          });
          
          // Return context with the previous value
          return { previousPetition };
        },
        onSuccess: (data, variables) => {
          // Invalidate affected queries to refresh data
          queryClient.invalidateQueries(queryKeys.petition(variables.petitionId));
          queryClient.invalidateQueries(queryKeys.petitions);
          feedback.showSuccess(`Vote recorded: ${variables.voteType}`);
        },
        onError: (error: Error, variables, context: any) => {
          // Revert to previous state if mutation fails
          if (context?.previousPetition) {
            queryClient.setQueryData(
              queryKeys.petition(variables.petitionId),
              context.previousPetition
            );
          }
          feedback.showError(`Failed to vote: ${error.message}`);
        },
        onSettled: (data, error, variables) => {
          // Always refetch after error or success to ensure consistency
          queryClient.invalidateQueries(queryKeys.petition(variables.petitionId));
        },
      }
    );
  };

  return {
    usePetitions,
    usePetitionById,
    useEligibility,
    useCreatePetition,
    useVotePetition,
  };
};
