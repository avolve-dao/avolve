"use client";

import React, { useState } from 'react';
import { useChallenges } from '../../hooks/useChallenges';
import { TokenSymbols, type TokenSymbol } from '@/types/platform';

/**
 * ChallengesList Component
 * Displays today's challenges and allows users to complete them
 */
const ChallengesList: React.FC = () => {
  const {
    loading,
    error,
    todayChallenges,
    userProgress,
    completeChallenge,
    isChallengeCompletedToday,
    getProgressForToken,
    refreshChallengeData
  } = useChallenges();

  const [completing, setCompleting] = useState<string | null>(null);
  const [completionResult, setCompletionResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Handle challenge completion
  const handleCompleteChallenge = async (challengeId: string) => {
    setCompleting(challengeId);
    setCompletionResult(null);
    
    try {
      const result = await completeChallenge(challengeId);
      
      if (result.success) {
        setCompletionResult({
          success: true,
          message: `Challenge completed! Earned ${result.data?.points} points for ${result.data?.tokenSymbol}.`,
          data: result.data
        });
        
        // Refresh challenge data after a short delay
        setTimeout(() => {
          refreshChallengeData();
        }, 1500);
      } else {
        setCompletionResult({
          success: false,
          message: result.error || 'Failed to complete challenge'
        });
      }
    } catch (err) {
      setCompletionResult({
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred'
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
      <h2 className="text-2xl font-bold mb-4">Today's Challenges</h2>
      
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Today's Token */}
          {todayChallenges && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg text-white ${getTokenColor(todayChallenges.dayToken)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">{todayChallenges.dayToken}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {getDayForToken(todayChallenges.dayToken)}
                    </p>
                  </div>
                  <div>
                    {todayChallenges.dayToken && (
                      <div className="text-right">
                        <p className="text-sm">Progress</p>
                        <p className="text-xl font-bold">
                          {getProgressForToken(todayChallenges.dayToken as TokenSymbol).points} pts
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Challenge List */}
          {todayChallenges?.challenges && todayChallenges.challenges.length > 0 ? (
            <div className="space-y-4">
              {todayChallenges.challenges.map((challenge) => {
                const isCompleted = isChallengeCompletedToday(challenge.id);
                
                return (
                  <div 
                    key={challenge.id} 
                    className={`p-4 border rounded-lg ${
                      isCompleted ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{challenge.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{challenge.description}</p>
                        <div className="flex items-center mt-2">
                          <div className={`w-4 h-4 rounded-full mr-2 ${getTokenColor(challenge.tokens?.symbol)}`}></div>
                          <span className="text-sm text-gray-500">{challenge.tokens?.symbol}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm font-medium">{challenge.points} points</span>
                        </div>
                      </div>
                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
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
                {todayChallenges?.challenges?.length === 0
                  ? "No challenges available for today's token."
                  : "No challenges available."
                }
              </p>
            </div>
          )}

          {/* Token Progress */}
          {userProgress.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Your Token Progress</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {userProgress.map((progress) => (
                  <div key={progress.id} className="p-3 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 rounded-full mr-2 ${getTokenColor(progress.tokens?.symbol)}`}></div>
                      <span className="font-medium">{progress.tokens?.symbol}</span>
                      {!progress.tokens?.is_locked && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Points:</span>
                      <span className="font-bold">{progress.points}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Level:</span>
                      <span className="font-bold">{progress.level}</span>
                    </div>
                    {progress.tokens?.is_locked && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">
                          {progress.points}/50 points to unlock
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (progress.points / 50) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Result */}
          {completionResult && (
            <div className={`mt-4 p-3 rounded ${
              completionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p>{completionResult.message}</p>
              {completionResult.success && completionResult.data?.unlocked && (
                <p className="mt-1 font-semibold">
                  🎉 You've unlocked {completionResult.data.tokenSymbol}!
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded bg-red-100 text-red-800">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChallengesList;
