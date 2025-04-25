'use client';

import React, { useState } from 'react';
import { useDailyClaims } from '../../hooks/useDailyClaims';
import { TokenSymbols } from '@/types/platform';

/**
 * DailyClaimCard Component
 * Displays today's token and allows users to claim it
 */
const DailyClaimCard: React.FC = () => {
  const { claims, loading, claimDaily } = useDailyClaims();

  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Handle claim action
  const handleClaim = async (claimId: string) => {
    setClaiming(claimId);
    setClaimResult(null);

    try {
      await claimDaily(claimId);
      setClaimResult({
        success: true,
        message: 'Daily token claimed successfully!',
      });
    } catch (err) {
      setClaimResult({
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setClaiming(null);
    }
  };

  // Get token color based on symbol
  const getTokenColor = (symbol: string): string => {
    switch (symbol) {
      case TokenSymbols.SPD:
        return 'bg-gradient-to-r from-red-500 to-blue-500'; // Red-Green-Blue
      case TokenSymbols.SHE:
        return 'bg-gradient-to-r from-rose-500 to-orange-500'; // Rose-Red-Orange
      case TokenSymbols.PSP:
        return 'bg-gradient-to-r from-amber-500 to-yellow-500'; // Amber-Yellow
      case TokenSymbols.SSA:
        return 'bg-gradient-to-r from-lime-500 to-emerald-500'; // Lime-Green-Emerald
      case TokenSymbols.BSP:
        return 'bg-gradient-to-r from-teal-500 to-cyan-500'; // Teal-Cyan
      case TokenSymbols.SGB:
        return 'bg-gradient-to-r from-sky-500 to-indigo-500'; // Sky-Blue-Indigo
      case TokenSymbols.SMS:
        return 'bg-gradient-to-r from-violet-500 to-fuchsia-500'; // Violet-Purple-Fuchsia-Pink
      case TokenSymbols.SAP:
        return 'bg-gradient-to-r from-slate-500 to-slate-700'; // Stone gradient
      case TokenSymbols.SCQ:
        return 'bg-gradient-to-r from-slate-400 to-slate-600'; // Slate gradient
      case TokenSymbols.GEN:
        return 'bg-gradient-to-r from-zinc-400 to-zinc-600'; // Zinc gradient
      default:
        return 'bg-gray-500';
    }
  };

  // Get day for token
  const getDayForToken = (symbol: string): string => {
    switch (symbol) {
      case TokenSymbols.SPD:
        return 'Sunday';
      case TokenSymbols.SHE:
        return 'Monday';
      case TokenSymbols.PSP:
        return 'Tuesday';
      case TokenSymbols.SSA:
        return 'Wednesday';
      case TokenSymbols.BSP:
        return 'Thursday';
      case TokenSymbols.SGB:
        return 'Friday';
      case TokenSymbols.SMS:
        return 'Saturday';
      case TokenSymbols.SAP:
        return 'Any Day';
      case TokenSymbols.SCQ:
        return 'Any Day';
      case TokenSymbols.GEN:
        return 'Any Day';
      default:
        return 'Unknown';
    }
  };

  // Find today's token from claims
  const todayToken = claims && claims.length > 0 ? claims[0] : null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Daily Token Claim</h2>

      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {todayToken ? (
            <div className="mb-4">
              <div className={`p-4 rounded-lg text-white ${getTokenColor(todayToken.token_type)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">{todayToken.token_type}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {getDayForToken(todayToken.token_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Reward</p>
                    <p className="text-xl font-bold">{todayToken.amount} pts</p>
                  </div>
                </div>
              </div>

              {todayToken.claimed ? (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Already claimed today
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(todayToken.id)}
                  disabled={!!claiming}
                  className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {claiming === todayToken.id ? 'Claiming...' : 'Claim Now'}
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg mb-4 text-center">
              <p className="text-gray-500">No daily token available to claim.</p>
            </div>
          )}

          {/* Claim Streak Info */}
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <h3 className="text-lg font-semibold mb-3">Claim Streak</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Current Streak</span>
              <span className="font-bold">0 days</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Longest Streak</span>
              <span className="font-bold">0 days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Claim daily to build your streak!</p>
          </div>

          {/* Recent Claims */}
          {claims && claims.length > 1 && (
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <h3 className="text-lg font-semibold mb-3">Recent Claims</h3>
              <div className="space-y-2">
                {claims.slice(1).map(claim => (
                  <div
                    key={claim.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full mr-2 ${getTokenColor(claim.token_type)}`}
                      ></div>
                      <span className="font-medium">{claim.token_type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-medium">+{claim.amount}</span>
                      <span className="text-xs text-gray-500 block">Claimed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Result */}
          {claimResult && (
            <div
              className={`mt-4 p-3 rounded ${claimResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              <p>{claimResult.message}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DailyClaimCard;
