/**
 * Economy API Client
 *
 * This file provides functions for interacting with the token economy
 * of the Avolve platform, including tokens, balances, transactions, rewards, and staking.
 */

import { ApiClient, ApiError } from './client';
import type {
  Token,
  UserToken,
  TokenTransaction,
  TokenReward,
  TokenStaking,
  ActivityType,
  TransactionType,
} from '@/lib/types/database.types';

export class EconomyApi extends ApiClient {
  /**
   * Get all tokens
   */
  async getTokens() {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .order('is_primary', { ascending: false });

      if (error) throw error;

      return data as Token[];
    } catch (error) {
      this.handleError(error, 'Failed to fetch tokens');
    }
  }

  /**
   * Get a token by symbol
   */
  async getTokenBySymbol(symbol: string) {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (error) throw error;

      return data as Token;
    } catch (error) {
      this.handleError(error, `Failed to fetch token with symbol: ${symbol}`);
    }
  }

  /**
   * Get all tokens for a user
   */
  async getUserTokens(userId: string) {
    try {
      const { data, error } = await this.client
        .from('user_tokens')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data as UserToken[];
    } catch (error) {
      this.handleError(error, 'Failed to fetch user tokens');
    }
  }

  /**
   * Get user token balances
   */
  async getUserTokenBalances(userId: string) {
    try {
      const { data, error } = await this.client.rpc('get_user_token_balances', {
        p_user_id: userId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch user token balances');
    }
  }

  /**
   * Get user token transactions
   */
  async getUserTokenTransactions(userId: string, limit: number = 10, offset: number = 0) {
    try {
      const { data, error } = await this.client
        .from('token_transactions')
        .select('*, tokens(*)')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch user token transactions');
    }
  }

  /**
   * Get transactions for a user
   */
  async getUserTransactions(userId: string, limit: number = 10) {
    try {
      const { data, error } = await this.client
        .from('token_transactions')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as TokenTransaction[];
    } catch (error) {
      this.handleError(error, 'Failed to fetch user transactions');
    }
  }

  /**
   * Transfer tokens between users
   */
  async transferTokens(
    fromUserId: string,
    toUserId: string,
    tokenSymbol: string,
    amount: number,
    reason?: string
  ) {
    try {
      const { data, error } = await this.client.rpc('transfer_tokens', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_token_symbol: tokenSymbol,
        p_amount: amount,
        p_reason: reason,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to transfer tokens');
    }
  }

  /**
   * Reward user with tokens
   */
  async rewardUser(
    userId: string,
    tokenSymbol: string,
    activityType: ActivityType,
    customAmount?: number,
    customMultiplier?: number
  ) {
    try {
      const { data, error } = await this.client.rpc('reward_user', {
        p_user_id: userId,
        p_token_symbol: tokenSymbol,
        p_activity_type: activityType,
        p_custom_amount: customAmount,
        p_custom_multiplier: customMultiplier,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to reward user');
    }
  }

  /**
   * Get token rewards configuration
   */
  async getTokenRewards(tokenId?: string) {
    try {
      let query = this.client.from('token_rewards').select('*, tokens(*)');

      if (tokenId) {
        query = query.eq('token_id', tokenId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch token rewards');
    }
  }

  /**
   * Get user token staking
   */
  async getUserTokenStaking(userId: string) {
    try {
      const { data, error } = await this.client
        .from('token_staking')
        .select('*, tokens(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch user token staking');
    }
  }

  /**
   * Stake tokens
   */
  async stakeTokens(userId: string, tokenId: string, amount: number, lockDurationDays: number) {
    try {
      // Calculate end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + lockDurationDays);

      // Calculate reward rate based on duration
      // 30 days = 5%, 90 days = 10%, 180 days = 15%, 365 days = 20%
      let rewardRate = 0.05;
      if (lockDurationDays >= 365) {
        rewardRate = 0.2;
      } else if (lockDurationDays >= 180) {
        rewardRate = 0.15;
      } else if (lockDurationDays >= 90) {
        rewardRate = 0.1;
      }

      // Insert staking record
      const { data: stakingData, error: stakingError } = await this.client
        .from('token_staking')
        .insert({
          user_id: userId,
          token_id: tokenId,
          amount: amount,
          lock_duration_days: lockDurationDays,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          reward_rate: rewardRate,
          reward_amount: 0,
        })
        .select()
        .single();

      if (stakingError) throw stakingError;

      // Update user token balance
      const { data: userTokenData, error: userTokenError } = await this.client
        .from('user_tokens')
        .update({
          balance: this.client.rpc('decrement', { x: amount }),
          staked_balance: this.client.rpc('increment', { x: amount }),
        })
        .eq('user_id', userId)
        .eq('token_id', tokenId)
        .select()
        .single();

      if (userTokenError) throw userTokenError;

      // Record transaction
      const { data: transactionData, error: transactionError } = await this.client
        .from('token_transactions')
        .insert({
          token_id: tokenId,
          from_user_id: userId,
          to_user_id: userId,
          amount: amount,
          transaction_type: 'stake',
          reason: `Staked for ${lockDurationDays} days at ${rewardRate * 100}% reward rate`,
        });

      if (transactionError) throw transactionError;

      return stakingData;
    } catch (error) {
      this.handleError(error, 'Failed to stake tokens');
    }
  }
}
