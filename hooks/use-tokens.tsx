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
    getTokenDetails,
    setSelectedToken,
    
    // Utilities
    getTokenBalance,
    hasEnoughTokens,
    getTokenSupply
  };
}
