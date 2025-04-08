"use client"

import React from 'react';
import { useDailyClaims } from '../../hooks/useDailyClaims';
import { TokenSymbol } from '../../types/supabase';

/**
 * DailyClaimCard Component
 * Displays the daily token claim card with streak information and claim button
 */
const DailyClaimCard: React.FC = () => {
  const {
    loading,
    error,
    canClaim,
    todayToken,
    claimStreak,
    recentClaims,
    claimDailyToken,
    getDayForToken
  } = useDailyClaims();

  const [claiming, setClaiming] = React.useState(false);
  const [claimResult, setClaimResult] = React.useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Handle claim button click
  const handleClaim = async () => {
    if (!canClaim) return;
    
    setClaiming(true);
    setClaimResult(null);
    
    try {
      const result = await claimDailyToken();
      
      if (result.success) {
        setClaimResult({
          success: true,
          message: `Successfully claimed ${result.data?.amount} ${result.data?.tokenSymbol} tokens!`,
          data: result.data
        });
      } else {
        setClaimResult({
          success: false,
          message: result.error || 'Failed to claim token'
        });
      }
    } catch (err) {
      setClaimResult({
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred'
      });
    } finally {
      setClaiming(false);
    }
  };

  // Get token color based on symbol
  const getTokenColor = (symbol?: string): string => {
    switch (symbol) {
      case TokenSymbol.SPD: return 'bg-gradient-to-r from-red-500 to-blue-500'; // Red-Green-Blue
      case TokenSymbol.SHE: return 'bg-gradient-to-r from-rose-500 to-orange-500'; // Rose-Red-Orange
      case TokenSymbol.PSP: return 'bg-gradient-to-r from-amber-500 to-yellow-500'; // Amber-Yellow
      case TokenSymbol.SSA: return 'bg-gradient-to-r from-lime-500 to-emerald-500'; // Lime-Green-Emerald
      case TokenSymbol.BSP: return 'bg-gradient-to-r from-teal-500 to-cyan-500'; // Teal-Cyan
      case TokenSymbol.SGB: return 'bg-gradient-to-r from-sky-500 to-indigo-500'; // Sky-Blue-Indigo
      case TokenSymbol.SMS: return 'bg-gradient-to-r from-violet-500 to-fuchsia-500'; // Violet-Purple-Fuchsia-Pink
      case TokenSymbol.SAP: return 'bg-gradient-to-r from-slate-500 to-slate-700'; // Stone gradient
      case TokenSymbol.SCQ: return 'bg-gradient-to-r from-slate-400 to-slate-600'; // Slate gradient
      case TokenSymbol.GEN: return 'bg-gradient-to-r from-zinc-400 to-zinc-600'; // Zinc gradient
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Daily Token Claim</h2>
      
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Today's Token */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Today's Token</h3>
            {todayToken ? (
              <div className={`p-4 rounded-lg text-white ${getTokenColor(todayToken.symbol)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">{todayToken.symbol}</p>
                    <p className="text-sm opacity-90">{todayToken.name}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {getDayForToken(todayToken.symbol as TokenSymbol)}
                    </p>
                  </div>
                  {canClaim ? (
                    <button
                      onClick={handleClaim}
                      disabled={claiming}
                      className="px-4 py-2 bg-white text-gray-800 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      {claiming ? 'Claiming...' : 'Claim Now'}
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded">
                      Already Claimed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No token available for today</p>
            )}
          </div>

          {/* Streak Information */}
          {claimStreak && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Streak</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Current Streak:</span>
                  <span className="text-xl font-bold">{claimStreak.currentStreak} days</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Current Multiplier:</span>
                  <span className="text-lg font-semibold">{claimStreak.currentMultiplier}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next Multiplier:</span>
                  <span>
                    {claimStreak.nextMultiplierAt > 0 ? (
                      <span>in {claimStreak.nextMultiplierAt} days</span>
                    ) : (
                      <span className="text-green-600">Active!</span>
                    )}
                  </span>
                </div>
                
                {/* Streak Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>1 day</span>
                    <span>3 days (1.2x)</span>
                    <span>5 days (1.5x)</span>
                    <span>7 days (1.7x)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, (claimStreak.currentStreak / 7) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Claims */}
          {recentClaims.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Recent Claims</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentClaims.map((claim) => (
                      <tr key={claim.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full mr-2 ${getTokenColor(claim.tokens?.symbol)}`}></div>
                            <span>{claim.tokens?.symbol}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {claim.amount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Claim Result */}
          {claimResult && (
            <div className={`p-3 rounded ${
              claimResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p>{claimResult.message}</p>
              {claimResult.success && claimResult.data && (
                <div className="mt-2 text-sm">
                  <p>
                    <span className="font-medium">Streak:</span> {claimResult.data.streakDays} days
                  </p>
                  <p>
                    <span className="font-medium">Multiplier:</span> {claimResult.data.multiplier}x
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded bg-red-100 text-red-800">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DailyClaimCard;
