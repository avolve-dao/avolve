import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useSubscription } from '../../hooks/useSubscription';
import { TokenSymbol } from '../../types/supabase';

/**
 * SubscriptionManager Component
 * Handles subscription creation, token spending, and displays metrics
 */
const SubscriptionManager: React.FC = () => {
  const user = useUser();
  const {
    loading,
    error,
    subscription,
    treasuryAllocations,
    metrics,
    subscribe,
    cancelSubscription,
    spendForInternalTokens,
    submitNPS,
    refreshData
  } = useSubscription();

  const [amount, setAmount] = useState<number>(100);
  const [spendAmount, setSpendAmount] = useState<number>(10);
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(TokenSymbol.SAP);
  const [npsScore, setNpsScore] = useState<number>(8);
  const [npsFeedback, setNpsFeedback] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Handle subscription
  const handleSubscribe = async () => {
    setProcessing(true);
    setStatusMessage('Processing subscription...');
    
    try {
      const result = await subscribe(amount);
      
      if (result.success) {
        setStatusMessage('Subscription successful! GEN tokens minted.');
      } else {
        setStatusMessage(`Subscription failed: ${result.error}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle cancellation
  const handleCancel = async () => {
    setProcessing(true);
    setStatusMessage('Cancelling subscription...');
    
    try {
      const result = await cancelSubscription();
      
      if (result.success) {
        setStatusMessage('Subscription cancelled.');
      } else {
        setStatusMessage(`Cancellation failed: ${result.error}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle token spending
  const handleSpendTokens = async () => {
    setProcessing(true);
    setStatusMessage(`Spending ${spendAmount} GEN for ${selectedToken} tokens...`);
    
    try {
      const result = await spendForInternalTokens(
        spendAmount,
        selectedToken,
        `Purchase of ${selectedToken} tokens`
      );
      
      if (result.success) {
        setStatusMessage(`Successfully purchased ${selectedToken} tokens!`);
      } else {
        setStatusMessage(`Purchase failed: ${result.error}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle NPS submission
  const handleSubmitNPS = async () => {
    setProcessing(true);
    setStatusMessage('Submitting NPS score...');
    
    try {
      const result = await submitNPS(npsScore, npsFeedback);
      
      if (result.success) {
        setStatusMessage('NPS score submitted. Thank you for your feedback!');
        setNpsFeedback('');
      } else {
        setStatusMessage(`NPS submission failed: ${result.error}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Subscription Manager</h2>
        <p>Please log in to manage your subscription.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Subscription Manager</h2>
      
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Subscription Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Subscription Status</h3>
            {subscription ? (
              <div>
                <p className="mb-2">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded text-sm ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status.toUpperCase()}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="font-medium">Amount:</span> ${subscription.amount_usd}/month
                </p>
                <p className="mb-2">
                  <span className="font-medium">Next billing:</span>{' '}
                  {new Date(subscription.next_billing_at).toLocaleDateString()}
                </p>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-4">You don't have an active subscription.</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={processing}
                    className="w-full sm:w-auto mt-4 sm:mt-6 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Subscribe (${amount}/month)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Token Spending */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Spend GEN for Internal Tokens</h3>
            <p className="mb-4 text-sm text-gray-600">
              $1 USD = 1 internal token unit. Spending increases ARPU metrics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (GEN)
                </label>
                <input
                  type="number"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Type
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={TokenSymbol.SAP}>SAP (Superachiever)</option>
                  <option value={TokenSymbol.SCQ}>SCQ (Superachievers)</option>
                  <option value={TokenSymbol.PSP}>PSP (Personal Success)</option>
                  <option value={TokenSymbol.BSP}>BSP (Business Success)</option>
                  <option value={TokenSymbol.SMS}>SMS (Supermind)</option>
                  <option value={TokenSymbol.SPD}>SPD (Superpuzzle)</option>
                  <option value={TokenSymbol.SHE}>SHE (Superhuman)</option>
                  <option value={TokenSymbol.SSA}>SSA (Supersociety)</option>
                  <option value={TokenSymbol.SGB}>SGB (Supergenius)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSpendTokens}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Purchase Tokens
                </button>
              </div>
            </div>
          </div>

          {/* Treasury Allocations */}
          {treasuryAllocations.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Treasury Allocations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allocation (USD)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {treasuryAllocations.map((allocation, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {allocation.tokens?.symbol || 'Unknown'} ({allocation.tokens?.name || 'Unknown'})
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          ${allocation.sum.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {allocation.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Platform Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-500">DAU/MAU Ratio</p>
                  <p className="text-xl font-bold">
                    {(metrics.dauMauRatio * 100).toFixed(1)}%
                  </p>
                  {metrics.boostEligible && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Boost Eligible
                    </span>
                  )}
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-500">Retention</p>
                  <p className="text-xl font-bold">
                    {(metrics.retention * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-500">ARPU</p>
                  <p className="text-xl font-bold">${metrics.arpu.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-500">NPS</p>
                  <p className="text-xl font-bold">{metrics.nps.toFixed(1)}</p>
                </div>
              </div>
            </div>
          )}

          {/* NPS Feedback */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Rate Your Experience</h3>
            <p className="mb-4 text-sm text-gray-600">
              How likely are you to recommend Avolve to a friend or colleague?
            </p>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => setNpsScore(score)}
                    className={`w-8 h-8 rounded-full ${
                      npsScore === score
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not likely at all</span>
                <span>Extremely likely</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (optional)
              </label>
              <textarea
                value={npsFeedback}
                onChange={(e) => setNpsFeedback(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="What could we improve?"
              ></textarea>
            </div>
            <button
              onClick={handleSubmitNPS}
              disabled={processing}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        </>
      )}
      
      {/* Status Message */}
      {statusMessage && (
        <div className={`p-3 rounded ${
          statusMessage.includes('failed') || statusMessage.includes('Error')
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
