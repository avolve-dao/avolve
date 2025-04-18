"use client";

import React, { useState } from 'react';
import { useChallenges } from '../../hooks/useChallenges';
import { TokenSymbols } from '@/types/platform';

/**
 * ChallengesList Component
 * Displays today's challenges and allows users to complete them
 */
const ChallengesList: React.FC<unknown> = () => {
  const {
    challenges: challengesHook,
    loading,
    claimReward
  } = useChallenges();

  const [completing, setCompleting] = useState<string | null>(null);
  const [completionResult, setCompletionResult] = useState<{
    success: boolean;
    message: string;
    data?: unknown;
  } | null>(null);

  // Handle challenge completion
  const handleCompleteChallenge = async (challengeId: string) => {
    setCompleting(challengeId);
    setCompletionResult(null);
    
    try {
      await claimReward(challengeId);
      setCompletionResult({
        success: true,
        message: `Challenge reward claimed successfully!`
      });
      // No further action needed since toast is handled in the hook
    } catch (err) {
      setCompletionResult({
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred claiming the reward'
      });
    } finally {
      setCompleting(null);
    }
  };

  // Get token color based on symbol
  const getTokenColor = (symbol?: string): string => {
    switch (symbol) {
      case TokenSymbols.SPD: return 'bg-gradient-to-r from-red-500 to-blue-500'; // Red-Green-Blue
      case TokenSymbols.SHE: return 'bg-gradient-to-r from-rose-500 to-orange-500'; // Rose-Red-Orange
      case TokenSymbols.PSP: return 'bg-gradient-to-r from-amber-500 to-yellow-500'; // Amber-Yellow
      case TokenSymbols.SSA: return 'bg-gradient-to-r from-lime-500 to-emerald-500'; // Lime-Green-Emerald
      case TokenSymbols.BSP: return 'bg-gradient-to-r from-teal-500 to-cyan-500'; // Teal-Cyan
      case TokenSymbols.SGB: return 'bg-gradient-to-r from-sky-500 to-indigo-500'; // Sky-Blue-Indigo
      case TokenSymbols.SMS: return 'bg-gradient-to-r from-violet-500 to-fuchsia-500'; // Violet-Purple-Fuchsia-Pink
      case TokenSymbols.SAP: return 'bg-gradient-to-r from-slate-500 to-slate-700'; // Stone gradient
      case TokenSymbols.SCQ: return 'bg-gradient-to-r from-slate-400 to-slate-600'; // Slate gradient
      case TokenSymbols.GEN: return 'bg-gradient-to-r from-zinc-400 to-zinc-600'; // Zinc gradient
      default: return 'bg-gray-500';
    }
  };

  // Get day name for a token symbol
  const getDayForToken = (tokenSymbol: string): string => {
    switch (tokenSymbol) {
      case TokenSymbols.SPD: return 'Sunday';
      case TokenSymbols.SHE: return 'Monday';
      case TokenSymbols.PSP: return 'Tuesday';
      case TokenSymbols.SSA: return 'Wednesday';
      case TokenSymbols.BSP: return 'Thursday';
      case TokenSymbols.SGB: return 'Friday';
      case TokenSymbols.SMS: return 'Saturday';
      default: return '';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{"Today&apos;s Challenges"}</h2>
      
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Today's Token */}
          {challengesHook && challengesHook.length > 0 && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg text-white ${getTokenColor(challengesHook[0].reward_token)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">{challengesHook[0].reward_token}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {getDayForToken(challengesHook[0].reward_token)}
                    </p>
                  </div>
                  <div>
                    {challengesHook[0].reward_token && (
                      <div className="text-right">
                        <p className="text-sm">Progress</p>
                        <p className="text-xl font-bold">
                          {challengesHook[0].progress} pts
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Challenge List */}
          {challengesHook && challengesHook.length > 0 ? (
            <div className="space-y-4">
              {challengesHook.map((challenge) => {
                const isCompleted = challenge.completed;
                
                return (
                  <div 
                    key={challenge.id} 
                    className={`p-4 border rounded-lg ${isCompleted ? 'bg-gray-50 border-gray-200' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`font-semibold ${isCompleted ? 'text-gray-500' : ''}`}>{challenge.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${getTokenColor(challenge.reward_token)}`}></div>
                        <span className="text-sm font-medium">+{challenge.reward_amount}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (challenge.progress / challenge.total_required) * 100)}%` }} 
                        ></div>
                      </div>
                      <div className="flex items-center">
                        {isCompleted ? (
                          <span className="text-sm text-green-600 font-medium mr-2">
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteChallenge(challenge.id)}
                            disabled={!!completing}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {completing === challenge.id ? 'Completing...' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {challengesHook?.length === 0
                  ? "No challenges available for today's token."
                  : "No challenges available."
                }
              </p>
            </div>
          )}

          {/* Completion Result */}
          {completionResult && (
            <div className={`mt-4 p-3 rounded ${
              completionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p>{completionResult.message}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChallengesList;
