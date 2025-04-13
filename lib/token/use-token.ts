/**
 * Token Hook
 * 
 * This hook provides token-related functionality for React components.
 * It wraps the TokenService to provide a more React-friendly interface.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '../supabase/use-supabase';
import { AuthError } from '@supabase/supabase-js';
import { TokenService, TokenResult } from './token-service';
import { useAuth } from '../auth/use-auth';

// Define interfaces that match exactly what the TokenService returns
interface Token {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  is_active?: boolean;
  is_transferable?: boolean;
  transfer_fee?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface UserToken {
  id: string;
  user_id: string;
  token_id: string;
  balance: number;
  staked_balance?: number;
  pending_release?: number;
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
}

interface TokenTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  token_id: string;
  amount: number;
  fee?: number;
  transaction_type: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

interface TokenType {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_token_type_id?: string;
  is_system?: boolean;
  symbol?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UseTokenResult {
  tokens: Token[];
  userTokens: UserToken[];
  transactions: TokenTransaction[];
  loading: boolean;
  error: Error | null;
  refreshTokens: () => Promise<void>;
  refreshUserTokens: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getToken: (tokenId: string) => Promise<Token | null>;
  getUserToken: (tokenId: string) => Promise<UserToken | null>;
  getTokenBalance: (tokenId: string) => Promise<number | null>;
  getAllTokenTypes: () => Promise<TokenType[]>;
  getUserTokenBalance: (tokenCode: string) => Promise<TokenResult<number>>;
  transferTokens: (toUserId: string, tokenId: string, amount: number) => Promise<{
    success: boolean;
    message: string;
    transaction_id?: string;
    amount?: number;
    fee?: number;
    net_amount?: number;
  }>;
}

export function useToken(): UseTokenResult {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [tokenService] = useState(() => new TokenService(supabase));
  const [tokens, setTokens] = useState<Token[]>([]);
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshTokens = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await tokenService.getAllTokens();
      if (error) {
        throw error;
      }
      setTokens(data || []);
      setError(null);
    } catch (err) {
      console.error('Error refreshing tokens:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [tokenService]);

  const refreshUserTokens = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await tokenService.getUserTokens(user.id);
      if (error) {
        throw error;
      }
      setUserTokens(data || []);
      setError(null);
    } catch (err) {
      console.error('Error refreshing user tokens:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [tokenService, user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await tokenService.getUserTransactions(user.id);
      if (error) {
        throw error;
      }
      setTransactions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [tokenService, user]);

  const getToken = useCallback(async (tokenId: string): Promise<Token | null> => {
    try {
      const { data, error } = await tokenService.getTokenById(tokenId);
      if (error) {
        throw error;
      }
      return data;
    } catch (err) {
      console.error(`Error getting token ${tokenId}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, [tokenService]);

  const getUserToken = useCallback(async (tokenId: string): Promise<UserToken | null> => {
    if (!user) return null;
    
    try {
      // Use getUserTokens and filter for the specific token
      const { data, error } = await tokenService.getUserTokens(user.id);
      if (error) {
        throw error;
      }
      
      const userToken = data?.find(token => token.token_id === tokenId) || null;
      return userToken;
    } catch (err) {
      console.error(`Error getting user token ${tokenId}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, [tokenService, user]);

  const getTokenBalance = useCallback(async (tokenId: string): Promise<number | null> => {
    if (!user) return null;
    
    try {
      // Get the user token and return its balance
      const userToken = await getUserToken(tokenId);
      return userToken ? userToken.balance : 0;
    } catch (err) {
      console.error(`Error getting token balance for ${tokenId}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, [getUserToken, user]);

  const getAllTokenTypes = useCallback(async (): Promise<TokenType[]> => {
    try {
      setLoading(true);
      const { data, error } = await tokenService.getAllTokenTypes();
      if (error) {
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error('Error getting token types:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [tokenService]);

  const getUserTokenBalance = useCallback(async (tokenCode: string): Promise<TokenResult<number>> => {
    if (!user) {
      const authError = new AuthError('User not authenticated');
      return { data: 0, error: authError };
    }
    
    try {
      // First get the token ID from the code
      const { data: tokenTypes, error: tokenTypesError } = await tokenService.getAllTokenTypes();
      if (tokenTypesError) {
        throw tokenTypesError;
      }
      
      const tokenType = tokenTypes?.find(tt => tt.code === tokenCode);
      if (!tokenType) {
        return { data: 0, error: null };
      }
      
      // Now get tokens of this type
      const { data: tokens, error: tokensError } = await tokenService.getTokensByType(tokenType.id);
      if (tokensError) {
        throw tokensError;
      }
      
      if (!tokens || tokens.length === 0) {
        return { data: 0, error: null };
      }
      
      // Get user's balance for the first token of this type
      const userToken = await getUserToken(tokens[0].id);
      return { data: userToken ? userToken.balance : 0, error: null };
    } catch (err) {
      console.error(`Error getting token balance for ${tokenCode}:`, err);
      const authError = new AuthError(err instanceof Error ? err.message : 'Unknown error');
      return { data: 0, error: authError };
    }
  }, [tokenService, user, getUserToken]);

  const transferTokens = useCallback(async (
    toUserId: string, 
    tokenId: string, 
    amount: number
  ): Promise<{
    success: boolean;
    message: string;
    transaction_id?: string;
    amount?: number;
    fee?: number;
    net_amount?: number;
  }> => {
    if (!user) {
      const authError = new AuthError('You must be logged in to transfer tokens');
      return { success: false, message: authError.message };
    }
    
    try {
      const result = await tokenService.transferTokensWithFee(
        user.id,
        toUserId,
        tokenId,
        amount
      );
      
      if (result.error) {
        throw result.error;
      }
      
      // Refresh user tokens and transactions after successful transfer
      if (result.data && result.data.success) {
        await Promise.all([
          refreshUserTokens(),
          refreshTransactions()
        ]);
      }
      
      return result.data || {
        success: false,
        message: 'Unknown error occurred during token transfer'
      };
    } catch (err) {
      console.error('Error transferring tokens:', err);
      const authError = new AuthError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return { success: false, message: authError.message };
    }
  }, [tokenService, user, refreshUserTokens, refreshTransactions]);

  // Load tokens, user tokens, and transactions on mount
  useEffect(() => {
    refreshTokens();
  }, [refreshTokens]);

  useEffect(() => {
    if (user) {
      refreshUserTokens();
      refreshTransactions();
    }
  }, [user, refreshUserTokens, refreshTransactions]);

  return {
    tokens,
    userTokens,
    transactions,
    loading,
    error,
    refreshTokens,
    refreshUserTokens,
    refreshTransactions,
    getToken,
    getUserToken,
    getTokenBalance,
    getAllTokenTypes,
    getUserTokenBalance,
    transferTokens
  };
}
