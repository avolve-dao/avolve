import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { tokensService } from '../src/tokens';
import { useToast } from './useToast';

/**
 * Hook for managing tokens functionality
 * Provides methods for viewing balances, transferring tokens, and GEN utility
 */
export const useTokens = () => {
  const user = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [userBalances, setUserBalances] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [genBalance, setGenBalance] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  // Load all tokens
  const loadAllTokens = async () => {
    setLoading(true);
    try {
      const result = await tokensService.getAllTokens();
      if (result.success && result.data) {
        setTokens(result.data);
      } else {
        console.error('Failed to load tokens:', result.error);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user balances
  const loadUserBalances = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await tokensService.getUserBalances(user.id);
      if (result.success && result.data) {
        setUserBalances(result.data);
        
        // Extract GEN balance
        const genBalanceItem = result.data.find(
          item => item.tokens.symbol === 'GEN'
        );
        setGenBalance(genBalanceItem?.balance || 0);
      } else {
        console.error('Failed to load user balances:', result.error);
      }
    } catch (error) {
      console.error('Error loading user balances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user transactions
  const loadUserTransactions = async (limit: number = 10, offset: number = 0) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await tokensService.getUserTransactions(user.id, limit, offset);
      if (result.success && result.data) {
        setTransactions(result.data);
      } else {
        console.error('Failed to load transactions:', result.error);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load token details
  const loadTokenDetails = async (tokenId: string) => {
    setLoading(true);
    try {
      const result = await tokensService.getTokenDetails(tokenId);
      if (result.success && result.data) {
        setSelectedToken(result.data);
        return result.data;
      } else {
        console.error('Failed to load token details:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error loading token details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Transfer tokens
  const transferTokens = async (toUserId: string, tokenId: string, amount: number, reason: string) => {
    if (!user) {
      showToast('error', 'You must be logged in to transfer tokens');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await tokensService.transferTokens(
        user.id, toUserId, tokenId, amount, reason
      );
      
      if (result.success) {
        showToast('success', result.message || 'Tokens transferred successfully!');
        await loadUserBalances();
        await loadUserTransactions();
        return { success: true };
      } else {
        showToast('error', result.error || 'Failed to transfer tokens');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error transferring tokens:', error);
      showToast('error', 'An error occurred while transferring tokens');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Spend GEN tokens for utility purposes
   * - 10% of spent amount is burned to enhance scarcity
   * - Boosts ARPU in metrics
   * 
   * @param amount Amount of GEN to spend
   * @param purpose Purpose of the spend (e.g., marketplace, premium features)
   * @returns Result of the spend operation
   */
  const spendGen = async (amount: number, purpose: string) => {
    if (!user) {
      showToast('error', 'You must be logged in to spend GEN');
      return { success: false };
    }
    
    if (amount <= 0) {
      showToast('error', 'Amount must be greater than 0');
      return { success: false, error: 'Amount must be greater than 0' };
    }
    
    setLoading(true);
    try {
      const result = await tokensService.spendGen(user.id, amount, purpose);
      if (result.success && result.data) {
        showToast('success', `${amount} GEN spent successfully! (${result.data.burnAmount} GEN burned)`);
        await loadUserBalances();
        await loadUserTransactions();
        return { 
          success: true, 
          data: result.data 
        };
      } else {
        showToast('error', result.error || 'Failed to spend GEN');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error spending GEN:', error);
      showToast('error', 'An error occurred while spending GEN');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Get token supply
  const getTokenSupply = async (tokenSymbol: string) => {
    try {
      const result = await tokensService.getTokenSupply(tokenSymbol);
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('Failed to get token supply:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting token supply:', error);
      return null;
    }
  };

  // Get token by symbol
  const getTokenBySymbol = (symbol: string) => {
    return tokens.find(token => token.symbol === symbol);
  };

  // Get balance by token symbol
  const getBalanceBySymbol = (symbol: string) => {
    const balance = userBalances.find(
      item => item.tokens.symbol === symbol
    );
    return balance?.balance || 0;
  };

  // Load initial data
  useEffect(() => {
    loadAllTokens();
    
    if (user) {
      loadUserBalances();
      loadUserTransactions();
    } else {
      setUserBalances([]);
      setTransactions([]);
      setGenBalance(0);
    }
  }, [user]);

  return {
    loading,
    tokens,
    userBalances,
    transactions,
    genBalance,
    selectedToken,
    loadAllTokens,
    loadUserBalances,
    loadUserTransactions,
    loadTokenDetails,
    transferTokens,
    spendGen,
    getTokenSupply,
    getTokenBySymbol,
    getBalanceBySymbol,
    setSelectedToken
  };
};

export default useTokens;
