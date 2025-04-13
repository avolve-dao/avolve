import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * SubscriptionService - Handles user subscriptions, GEN minting, and fiat allocation
 */
export class SubscriptionService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = supabaseUrl, supabaseKey: string = supabaseAnonKey) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Process a subscription for a user
   * - Mints GEN tokens to the user
   * - Allocates fiat to treasury (10% GEN, 40% SAP, 50% SCQ)
   * - Applies boost based on platform metrics
   * 
   * @param userId User ID to subscribe
   * @param amountUsd Subscription amount in USD (default: 100)
   * @param paymentMethod Optional payment method details
   * @param metadata Optional metadata for the subscription
   * @returns Subscription result with allocation details
   */
  async subscribe(
    userId: string, 
    amountUsd: number = 100,
    paymentMethod?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Call the database function to process the subscription
      const { data, error } = await this.supabase.rpc('process_subscription', {
        p_user_id: userId,
        p_amount_usd: amountUsd,
        p_payment_method: paymentMethod,
        p_metadata: metadata
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown subscription error'
      };
    }
  }

  /**
   * Spend GEN tokens to receive internal tokens (SAP, SCQ, or sub-tokens)
   * $1 USD = 1 internal token unit
   * 
   * @param userId User ID spending the tokens
   * @param amountUsd Amount to spend in USD (GEN tokens)
   * @param tokenSymbol Symbol of the token to receive (e.g., 'SAP', 'SCQ', 'PSP')
   * @param description Optional description for the transaction
   * @returns Result of the spending operation
   */
  async spendForInternalTokens(
    userId: string,
    amountUsd: number,
    tokenSymbol: string,
    description?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Call the database function to spend GEN for internal tokens
      const { data, error } = await this.supabase.rpc('spend_internal_tokens', {
        p_user_id: userId,
        p_amount_usd: amountUsd,
        p_token_symbol: tokenSymbol,
        p_description: description || `GEN spent for ${tokenSymbol} tokens`
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Token spending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown token spending error'
      };
    }
  }

  /**
   * Get a user's subscription details
   * 
   * @param userId User ID to check
   * @returns Subscription details if found
   */
  async getUserSubscription(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: !!data,
        data: data || null
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting subscription'
      };
    }
  }

  /**
   * Cancel a user's subscription
   * 
   * @param userId User ID to cancel subscription for
   * @returns Result of the cancellation
   */
  async cancelSubscription(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error cancelling subscription'
      };
    }
  }

  /**
   * Get treasury allocation details
   * 
   * @returns Current treasury allocation statistics
   */
  async getTreasuryAllocations(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('treasury_allocations')
        .select(`
          token_id,
          tokens (symbol, name),
          sum(amount_usd),
          percentage
        `)
        .group('token_id, tokens.symbol, tokens.name, percentage');

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get treasury allocations error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting treasury allocations'
      };
    }
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService();

// Export default for direct imports
export default subscriptionService;
