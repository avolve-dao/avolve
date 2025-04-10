import React, { useState } from 'react';
import { useGovernanceQuery } from '@/hooks/useGovernanceQuery';
import { useGovernanceFeedback, GovernanceActionFeedback } from './GovernanceActionFeedback';
import { useUser } from '@/hooks/useUser';
import { motion } from 'framer-motion';

// Token type gradient mapping
const tokenGradients = {
  GEN: 'from-indigo-500 via-purple-500 to-pink-500', // Supercivilization
  SAP: 'from-amber-500 to-yellow-500', // Superachiever
  SCQ: 'from-lime-500 via-green-500 to-emerald-500', // Superachievers
  PSP: 'from-amber-500 to-yellow-500', // Personal Success Puzzle
  BSP: 'from-teal-500 to-cyan-500', // Business Success Puzzle
  SMS: 'from-violet-500 via-purple-500 to-fuchsia-500', // Supermind Superpowers
  SPD: 'from-red-500 via-green-500 to-blue-500', // Superpuzzle Developments
  SHE: 'from-rose-500 via-red-500 to-orange-500', // Superhuman Enhancements
  SSA: 'from-lime-500 via-green-500 to-emerald-500', // Supersociety Advancements
  SGB: 'from-sky-500 via-blue-500 to-indigo-500', // Supergenius Breakthroughs
};

const GovernanceDashboard: React.FC = () => {
  const { user } = useUser();
  const { usePetitions, useEligibility, useCreatePetition, useVotePetition } = useGovernanceQuery();
  const feedback = useGovernanceFeedback();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  
  // Get governance data with react-query
  const { data: petitions, isLoading: petitionsLoading, error: petitionsError } = usePetitions();
  const { data: eligibility, isLoading: eligibilityLoading } = useEligibility();
  
  // Mutations
  const createPetitionMutation = useCreatePetition();
  const votePetitionMutation = useVotePetition();
  
  // Handle petition creation
  const handleCreatePetition = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentGiven) {
      feedback.showWarning('You must provide consent to create a petition in accordance with The Prime Law');
      return;
    }
    
    try {
      await createPetitionMutation.mutateAsync({ title, description });
      // Reset form on success
      setTitle('');
      setDescription('');
      setConsentGiven(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };
  
  // Handle voting
  const handleVote = async (petitionId: string, voteType: 'support' | 'oppose' | 'abstain') => {
    try {
      await votePetitionMutation.mutateAsync({ petitionId, voteType });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };
  
  if (!user) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
        <p className="text-center text-gray-600">Please sign in to access governance features.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Include the feedback component */}
      <GovernanceActionFeedback />
      
      {/* Eligibility Status */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Governance Eligibility</h2>
        
        {eligibilityLoading ? (
          <p className="text-gray-500">Checking eligibility...</p>
        ) : eligibility ? (
          <div className="space-y-2">
            <div className={`p-4 rounded-lg bg-gradient-to-r ${eligibility.eligible ? 'from-green-500 to-emerald-600' : 'from-amber-500 to-orange-600'} text-white`}>
              <p className="font-semibold">
                {eligibility.eligible 
                  ? 'You are eligible to participate in governance' 
                  : 'You are not yet eligible to participate in governance'}
              </p>
              <p className="text-sm mt-1">
                {eligibility.message}
              </p>
            </div>
            
            <div className="flex items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full bg-gradient-to-r ${tokenGradients.GEN}`} 
                  style={{ width: `${Math.min(100, (eligibility.tokenBalance / 100) * 100)}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {eligibility.tokenBalance} GEN
              </span>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Failed to check eligibility</p>
        )}
      </div>
      
      {/* Create Petition Form */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Create a Petition</h2>
        
        {eligibility?.eligible ? (
          <form onSubmit={handleCreatePetition} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="consent" className="font-medium text-gray-700">
                  I voluntarily consent to create this petition in accordance with The Prime Law
                </label>
                <p className="text-gray-500">
                  By checking this box, you confirm that you are creating this petition of your own free will, without coercion.
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={createPetitionMutation.isLoading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r ${tokenGradients.GEN} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${createPetitionMutation.isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {createPetitionMutation.isLoading ? 'Creating...' : 'Create Petition'}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800">
              You need at least 10 GEN tokens to create petitions. Participate in platform activities to earn more tokens.
            </p>
          </div>
        )}
      </div>
      
      {/* Petitions List */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Active Petitions</h2>
        
        {petitionsLoading ? (
          <p className="text-gray-500">Loading petitions...</p>
        ) : petitionsError ? (
          <p className="text-red-500">Failed to load petitions</p>
        ) : petitions?.length > 0 ? (
          <div className="space-y-6">
            {petitions.map((petition: any) => (
              <motion.div
                key={petition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">{petition.title}</h3>
                <p className="text-gray-600 mt-1">{petition.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {petition.support_count} Support
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {petition.oppose_count} Oppose
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!petition.user_vote ? (
                      <>
                        <button
                          onClick={() => handleVote(petition.id, 'support')}
                          disabled={votePetitionMutation.isLoading}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Support
                        </button>
                        <button
                          onClick={() => handleVote(petition.id, 'oppose')}
                          disabled={votePetitionMutation.isLoading}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Oppose
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        You voted: {petition.user_vote}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active petitions found.</p>
        )}
      </div>
    </div>
  );
};

export default GovernanceDashboard;
