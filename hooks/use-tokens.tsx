'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/components/supabase/provider';
import { useToast } from '@/components/ui/use-toast';
import { tokensService } from '@/lib/tokens';

// Token type definitions
export interface Token {
  id: string;
  symbol: string;
  name: string;
  description: string;
  balance: number;
  icon_url?: string;
  color?: string;
  pillar?: 'superachiever' | 'superachievers' | 'supercivilization';
  total_supply?: number;
  circulating_supply?: number;
  burn_rate?: number;
  gradient_class?: string;
  staked_balance?: number;
  parent_token_id?: string;
  parent_token_symbol?: string;
  pending_release?: number;
}

export interface TokenTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  token_id: string;
  amount: number;
  reason: string;
  created_at: string;
  token_symbol: string;
  token_name: string;
  from_user_name?: string;
  to_user_name?: string;
}

export interface TokenBalanceChange {
  token_id: string;
  previous_balance: number;
  new_balance: number;
  symbol: string;
}

export type TokenSpendPurpose = 
  | 'marketplace' 
  | 'premium_features' 
  | 'governance' 
  | 'staking' 
  | 'donation' 
  | 'other';

/**
 * Enhanced hook for managing tokens with real-time updates and optimized performance
 * Follows 2025 best practices for React hooks and Supabase integration
 */
export function useTokens() {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [balanceChanges, setBalanceChanges] = useState<TokenBalanceChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  /**
   * Fetch all tokens from the database
   */
  const fetchAllTokens = useCallback(async () => {
    if (!supabase) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tokens')
        .select('*')
        .order('symbol');
      
      if (fetchError) throw fetchError;
      
      setTokens(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tokens'));
      toast({
        title: 'Error',
        description: 'Failed to load tokens. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  /**
   * Fetch user token balances
   */
  const fetchUserBalances = useCallback(async () => {
    if (!supabase || !session?.user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('user_tokens')
        .select(`
          token_id,
          balance,
          tokens (
            id,
            symbol,
            name,
            description,
            icon_url,
            color,
            pillar
          )
        `)
        .eq('user_id', session.user.id);
      
      if (fetchError) throw fetchError;
      
      // Transform to a more efficient lookup structure
      const balances: Record<string, number> = {};
      data?.forEach(item => {
        if (item.tokens?.symbol) {
          balances[item.tokens.symbol] = item.balance;
        }
      });
      
      setUserBalances(balances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user balances'));
      toast({
        title: 'Error',
        description: 'Failed to load token balances. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, toast]);

  /**
   * Fetch user token transactions with pagination
   */
  const fetchUserTransactions = useCallback(async (limit = 10, offset = 0) => {
    if (!supabase || !session?.user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .rpc('get_user_transactions', { 
          p_user_id: session.user.id,
          p_limit: limit,
          p_offset: offset
        });
      
      if (fetchError) throw fetchError;
      
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
      toast({
        title: 'Error',
        description: 'Failed to load transaction history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, toast]);

  /**
   * Transfer tokens to another user
   */
  const transferTokens = useCallback(async (
    recipientId: string, 
    tokenSymbol: string, 
    amount: number, 
    reason: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!supabase || !session?.user) {
      return { 
        success: false, 
        error: 'You must be logged in to transfer tokens' 
      };
    }
    
    if (amount <= 0) {
      return { 
        success: false, 
        error: 'Amount must be greater than 0' 
      };
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token ID from symbol
      const token = tokens.find(t => t.symbol === tokenSymbol);
      if (!token) {
        return { 
          success: false, 
          error: `Token ${tokenSymbol} not found` 
        };
      }
      
      // Check if user has enough balance
      const currentBalance = userBalances[tokenSymbol] || 0;
      if (currentBalance < amount) {
        return { 
          success: false, 
          error: `Insufficient ${tokenSymbol} balance` 
        };
      }
      
      // Perform transfer using RPC function for atomic transaction
      const { data, error: transferError } = await supabase
        .rpc('transfer_tokens', {
          p_from_user_id: session.user.id,
          p_to_user_id: recipientId,
          p_token_id: token.id,
          p_amount: amount,
          p_reason: reason
        });
      
      if (transferError) throw transferError;
      
      // Update local state
      await fetchUserBalances();
      await fetchUserTransactions();
      
      toast({
        title: 'Transfer Successful',
        description: `${amount} ${tokenSymbol} transferred successfully!`,
      });
      
      return { 
        success: true, 
        message: `${amount} ${tokenSymbol} transferred successfully!` 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer tokens';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: 'Transfer Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, tokens, userBalances, toast, fetchUserBalances, fetchUserTransactions]);

  /**
   * Spend GEN tokens for utility purposes
   * - Implements token burning mechanism
   * - Records transaction history
   */
  const spendGenTokens = useCallback(async (
    amount: number, 
    purpose: TokenSpendPurpose
  ): Promise<{ success: boolean; burnAmount?: number; error?: string }> => {
    if (!supabase || !session?.user) {
      return { 
        success: false, 
        error: 'You must be logged in to spend GEN tokens' 
      };
    }
    
    if (amount <= 0) {
      return { 
        success: false, 
        error: 'Amount must be greater than 0' 
      };
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user has enough GEN
      const genBalance = userBalances['GEN'] || 0;
      if (genBalance < amount) {
        return { 
          success: false, 
          error: 'Insufficient GEN balance' 
        };
      }
      
      // Spend GEN using RPC function
      const { data, error: spendError } = await supabase
        .rpc('spend_gen_tokens', {
          p_user_id: session.user.id,
          p_amount: amount,
          p_purpose: purpose
        });
      
      if (spendError) throw spendError;
      
      // Update local state
      await fetchUserBalances();
      await fetchUserTransactions();
      
      const burnAmount = Math.floor(amount * 0.1); // 10% burn rate
      
      toast({
        title: 'GEN Spent Successfully',
        description: `${amount} GEN spent (${burnAmount} GEN burned)`,
      });
      
      return { 
        success: true, 
        burnAmount 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to spend GEN tokens';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: 'Transaction Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, userBalances, toast, fetchUserBalances, fetchUserTransactions]);

  /**
   * Award tokens to the current user (e.g., for completing an assessment or exercise)
   * @param tokenSymbol The symbol of the token to award (e.g., 'SAP')
   * @param amount The amount of tokens to add
   * @param reason The reason for awarding tokens (shown in transaction log)
   */
  const addTokens = useCallback(
    async (
      tokenSymbol: string,
      amount: number,
      reason: string
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      if (!supabase || !session?.user) {
        return {
          success: false,
          error: 'You must be logged in to receive tokens',
        };
      }
      if (amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0',
        };
      }
      try {
        setIsLoading(true);
        setError(null);
        // Get token ID from symbol
        const token = tokens.find((t) => t.symbol === tokenSymbol);
        if (!token) {
          return {
            success: false,
            error: `Token ${tokenSymbol} not found`,
          };
        }
        // Call Supabase RPC to award tokens atomically
        const { data, error: rpcError } = await supabase.rpc('award_tokens', {
          p_user_id: session.user.id,
          p_token_id: token.id,
          p_amount: amount,
          p_reason: reason,
        });
        if (rpcError) throw rpcError;
        // Refresh balances and transactions
        await fetchUserBalances();
        await fetchUserTransactions();
        toast({
          title: 'Tokens Awarded',
          description: `You received ${amount} ${tokenSymbol} for: ${reason}`,
        });
        return {
          success: true,
          message: `You received ${amount} ${tokenSymbol}`,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to award tokens';
        setError(err instanceof Error ? err : new Error(errorMessage));
        toast({
          title: 'Token Award Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, session, tokens, toast, fetchUserBalances, fetchUserTransactions]
  );

  /**
   * Get token details by symbol
   */
  const getTokenDetails = useCallback(async (symbol: string): Promise<Token | null> => {
    if (!supabase) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tokens')
        .select('*')
        .eq('symbol', symbol)
        .single();
      
      if (fetchError) throw fetchError;
      
      setSelectedToken(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch details for ${symbol}`));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * Get token balance by symbol
   */
  const getTokenBalance = useCallback((symbol: string): number => {
    return userBalances[symbol] || 0;
  }, [userBalances]);

  /**
   * Check if user has enough of a specific token
   */
  const hasEnoughTokens = useCallback((symbol: string, amount: number): boolean => {
    return getTokenBalance(symbol) >= amount;
  }, [getTokenBalance]);

  /**
   * Get token supply statistics
   */
  const getTokenSupply = useCallback(async (symbol: string) => {
    if (!supabase) return null;
    
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_token_supply_stats', { p_symbol: symbol });
      
      if (fetchError) throw fetchError;
      
      return data;
    } catch (err) {
      console.error(`Failed to fetch supply for ${symbol}:`, err);
      return null;
    }
  }, [supabase]);

  /**
   * Get all pillars progress for the current user
   */
  const getAllPillarsProgress = useCallback(async () => {
    if (!supabase || !session?.user) {
      return { data: null, error: 'Not authenticated' };
    }
    try {
      // Assuming there is a 'pillar_progress' table with user_id, pillar_id, progress_percentage
      const { data, error } = await supabase
        .from('pillar_progress')
        .select('*')
        .eq('user_id', session.user.id);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, [supabase, session]);

  // --- Legacy compatibility methods (from useToken) ---

  /**
   * Get a token by its ID
   */
  const getToken = useCallback(async (tokenId: string): Promise<Token | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('tokens').select('*').eq('id', tokenId).single();
    if (error) return null;
    return data;
  }, [supabase]);

  /**
   * Get a user's token by token ID
   */
  const getUserToken = useCallback(async (tokenId: string): Promise<any | null> => {
    if (!supabase || !session?.user) return null;
    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('token_id', tokenId)
      .single();
    if (error) return null;
    return data;
  }, [supabase, session]);

  /**
   * Get a user's balance for a given tokenId
   */
  const getTokenBalanceById = useCallback(async (tokenId: string): Promise<number | null> => {
    const userToken = await getUserToken(tokenId);
    return userToken ? userToken.balance : 0;
  }, [getUserToken]);

  /**
   * Get all token types
   */
  const getAllTokenTypes = useCallback(async (): Promise<any[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('token_types').select('*');
    if (error) return [];
    return data || [];
  }, [supabase]);

  /**
   * Get a user's token balance by token code
   */
  const getUserTokenBalance = useCallback(async (tokenCode: string): Promise<{ data: number, error: any }> => {
    if (!supabase || !session?.user) return { data: 0, error: 'Not authenticated' };
    const { data: tokenTypes, error: tokenTypesError } = await supabase.from('token_types').select('*');
    if (tokenTypesError) return { data: 0, error: tokenTypesError };
    const tokenType = (tokenTypes || []).find((tt: any) => tt.code === tokenCode);
    if (!tokenType) return { data: 0, error: null };
    const { data: tokens, error: tokensError } = await supabase.from('tokens').select('*').eq('type_id', tokenType.id);
    if (tokensError) return { data: 0, error: tokensError };
    if (!tokens || tokens.length === 0) return { data: 0, error: null };
    const userToken = await getUserToken(tokens[0].id);
    return { data: userToken ? userToken.balance : 0, error: null };
  }, [supabase, session, getUserToken]);

  // --- Achievement & Activity helpers (stubs, to be implemented as needed) ---
  const claimAchievementReward = async (..._args: any[]) => {
    throw new Error('claimAchievementReward is not implemented in useTokens.');
  };
  const trackActivity = async (..._args: any[]) => {
    throw new Error('trackActivity is not implemented in useTokens.');
  };

  // Set up real-time subscription for token balance updates
  useEffect(() => {
    if (!supabase || !session?.user) return;
    
    const channel = supabase
      .channel('token_balance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tokens',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          // Update balances in real-time
          fetchUserBalances();
          
          // Track balance changes for animations
          if (payload.new && payload.old) {
            const tokenId = payload.new.token_id;
            const newBalance = payload.new.balance;
            const oldBalance = payload.old.balance;
            
            // Find token symbol
            const token = tokens.find(t => t.id === tokenId);
            if (token) {
              setBalanceChanges(prev => [
                ...prev,
                {
                  token_id: tokenId,
                  previous_balance: oldBalance,
                  new_balance: newBalance,
                  symbol: token.symbol
                }
              ]);
              
              // Show toast for significant changes
              if (newBalance > oldBalance && newBalance - oldBalance >= 10) {
                toast({
                  title: 'Token Balance Updated',
                  description: `You received ${newBalance - oldBalance} ${token.symbol}!`,
                });
              }
            }
          }
        }
      )
      .subscribe();
    
    // Initial data fetch
    fetchAllTokens();
    fetchUserBalances();
    fetchUserTransactions();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, session, tokens, fetchAllTokens, fetchUserBalances, fetchUserTransactions, toast]);

  return {
    // State
    tokens,
    userBalances,
    transactions,
    balanceChanges,
    isLoading,
    error,
    selectedToken,
    
    // Actions
    fetchAllTokens,
    fetchUserBalances,
    fetchUserTransactions,
    transferTokens,
    spendGenTokens,
    addTokens,
    getTokenDetails,
    setSelectedToken,
    
    // Utilities
    getTokenBalance,
    hasEnoughTokens,
    getTokenSupply,
    getToken,
    getUserToken,
    getTokenBalanceById,
    getAllTokenTypes,
    getUserTokenBalance,
    getAllPillarsProgress,
    claimAchievementReward, // stub
    trackActivity // stub
  };
}
