/**
 * Token Service
 * 
 * This service centralizes all token management functionality for the Avolve platform.
 * It provides methods for managing tokens, token ownership, and token-based permissions.
 */

import { AuthError, SupabaseClient, createClient } from '@supabase/supabase-js';

// Result interface
export interface TokenResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// Token Type interface
export interface TokenType {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_token_type_id?: string;
  is_system?: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Token interface
export interface Token {
  id: string;
  token_type_id: string;
  name: string;
  symbol: string;
  description?: string;
  metadata?: Record<string, any>;
  is_transferable?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Token Ownership interface
export interface TokenOwnership {
  id: string;
  user_id: string;
  token_id: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  tokens?: Token;
}

// Token Permission interface
export interface TokenPermission {
  id: string;
  token_type_id: string;
  permission_id: string;
  min_balance: number;
  created_at?: string;
}

// Token Transaction interface
export interface TokenTransaction {
  id: string;
  token_id: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  transaction_type: string;
  status: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

// Transaction Types
export enum TransactionType {
  MINT = 'mint',
  BURN = 'burn',
  TRANSFER = 'transfer'
}

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

/**
 * Token Service Class
 */
export class TokenService {
  private client: SupabaseClient;

  /**
   * Constructor
   */
  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get all token types
   */
  public async getAllTokenTypes(): Promise<TokenResult<TokenType[]>> {
    try {
      const { data, error } = await this.client
        .from('token_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Get all token types error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all token types error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting token types') 
      };
    }
  }

  /**
   * Get a token type by ID
   */
  public async getTokenTypeById(id: string): Promise<TokenResult<TokenType>> {
    try {
      const { data, error } = await this.client
        .from('token_types')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get token type by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token type by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting token type') 
      };
    }
  }

  /**
   * Get a token type by code
   */
  public async getTokenTypeByCode(code: string): Promise<TokenResult<TokenType>> {
    try {
      const { data, error } = await this.client
        .from('token_types')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error) {
        console.error('Get token type by code error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token type by code error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting token type') 
      };
    }
  }

  /**
   * Create a new token type
   */
  public async createTokenType(
    code: string, 
    name: string, 
    description?: string, 
    parentTokenTypeId?: string,
    metadata?: Record<string, any>
  ): Promise<TokenResult<TokenType>> {
    try {
      const { data, error } = await this.client
        .from('token_types')
        .insert([{
          code,
          name,
          description,
          parent_token_type_id: parentTokenTypeId,
          metadata
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Create token type error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create token type error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating token type') 
      };
    }
  }

  /**
   * Get all tokens
   */
  public async getAllTokens(): Promise<TokenResult<Token[]>> {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Get all tokens error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all tokens error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting tokens') 
      };
    }
  }

  /**
   * Get tokens by token type
   */
  public async getTokensByType(tokenTypeId: string): Promise<TokenResult<Token[]>> {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .eq('token_type_id', tokenTypeId)
        .order('name');
      
      if (error) {
        console.error('Get tokens by type error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get tokens by type error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting tokens by type') 
      };
    }
  }

  /**
   * Create a new token
   */
  public async createToken(
    tokenTypeId: string,
    name: string,
    symbol: string,
    description?: string,
    isTransferable: boolean = true,
    metadata?: Record<string, any>
  ): Promise<TokenResult<Token>> {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .insert([{
          token_type_id: tokenTypeId,
          name,
          symbol,
          description,
          is_transferable: isTransferable,
          metadata
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Create token error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create token error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating token') 
      };
    }
  }

  /**
   * Get token by ID
   */
  public async getTokenById(id: string): Promise<TokenResult<Token>> {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get token by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting token') 
      };
    }
  }

  /**
   * Get user tokens
   */
  public async getUserTokens(userId: string): Promise<TokenResult<TokenOwnership[]>> {
    try {
      const { data, error } = await this.client
        .from('user_tokens')
        .select(`
          *,
          tokens(*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Get user tokens error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as TokenOwnership[], error: null };
    } catch (error) {
      console.error('Unexpected get user tokens error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user tokens') 
      };
    }
  }

  /**
   * Transfer tokens
   */
  public async transferTokens(
    fromUserId: string, 
    toUserId: string, 
    tokenId: string, 
    amount: number
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      const validation = await this.validateTransfer(fromUserId, tokenId, amount);
      if (!validation.success || !validation.token) {
        return { data: { success: false, message: validation.message }, error: null };
      }

      const { data: transactionId, error: rpcError } = await this.client.rpc(
        'process_token_transaction',
        {
          p_from_user_id: fromUserId,
          p_to_user_id: toUserId,
          p_token_id: tokenId,
          p_amount: amount,
          p_transaction_type: TransactionType.TRANSFER,
        }
      );

      if (rpcError) {
        console.error('Transfer token RPC error:', rpcError);
        return {
          data: { success: false, message: 'Failed to process transfer transaction via RPC' },
          error: convertError(rpcError)
        };
      }

      if (!transactionId) {
        console.warn('Transfer token RPC returned null ID, possible validation failure in function.');
        return {
          data: { success: false, message: 'Transfer transaction failed validation within database function (e.g., insufficient balance).' },
          error: null
        };
      }

      return {
        data: {
          success: true,
          message: 'Transfer initiated successfully',
          transaction_id: transactionId
        },
        error: null
      };
    } catch (error) {
      console.error('Unexpected transfer tokens error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while transferring tokens') 
      };
    }
  }

  /**
   * Mint tokens
   */
  public async mintTokens(
    tokenId: string,
    toUserId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      if (amount <= 0) {
        return { data: { success: false, message: 'Amount must be greater than zero' }, error: null };
      }

      const { data: transactionId, error: rpcError } = await this.client.rpc(
        'process_token_transaction',
        {
          p_from_user_id: null,
          p_to_user_id: toUserId,
          p_token_id: tokenId,
          p_amount: amount,
          p_transaction_type: TransactionType.MINT,
        }
      );

      if (rpcError) {
        console.error('Mint token RPC error:', rpcError);
        return {
          data: { success: false, message: 'Failed to process mint transaction via RPC' },
          error: convertError(rpcError)
        };
      }

      if (!transactionId) {
        console.warn('Mint token RPC returned null ID, possible validation failure in function.');
        return {
          data: { success: false, message: 'Mint transaction failed validation within database function.' },
          error: null
        };
      }

      return {
        data: {
          success: true,
          message: 'Tokens minted successfully',
          transaction_id: transactionId
        },
        error: null
      };
    } catch (error) {
      console.error('Unexpected mint tokens error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while minting tokens') 
      };
    }
  }

  /**
   * Burn tokens
   */
  public async burnTokens(
    tokenId: string,
    fromUserId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      const { data: transactionId, error: rpcError } = await this.client.rpc(
        'process_token_transaction',
        {
          p_from_user_id: fromUserId,
          p_to_user_id: null,
          p_token_id: tokenId,
          p_amount: amount,
          p_transaction_type: TransactionType.BURN,
        }
      );

      if (rpcError) {
        console.error('Burn token RPC error:', rpcError);
        return {
          data: { success: false, message: 'Failed to process burn transaction via RPC' },
          error: convertError(rpcError)
        };
      }

      if (!transactionId) {
        console.warn('Burn token RPC returned null ID, possible validation failure in function.');
        return {
          data: { success: false, message: 'Burn transaction failed validation within database function.' },
          error: null
        };
      }

      return {
        data: {
          success: true,
          message: 'Tokens burned successfully',
          transaction_id: transactionId
        },
        error: null
      };
    } catch (error) {
      console.error('Unexpected burn tokens error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while burning tokens') 
      };
    }
  }

  /**
   * Get user transactions
   */
  public async getUserTransactions(userId: string): Promise<TokenResult<TokenTransaction[]>> {
    try {
      const { data, error } = await this.client
        .from('token_transactions')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get user transactions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user transactions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user transactions') 
      };
    }
  }

  /**
   * Check if user has permission via token
   */
  public async hasPermissionViaToken(
    userId: string,
    resource: string,
    action: string
  ): Promise<TokenResult<boolean>> {
    try {
      const { data, error } = await this.client.rpc('has_permission_via_token', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Check permission via token error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected check permission via token error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking permission via token') 
      };
    }
  }

  /**
   * Record token activity
   */
  public async recordTokenActivity(
    userId: string | null,
    tokenId: string | null,
    activityType: string,
    metadata?: Record<string, any>
  ): Promise<TokenResult<string>> {
    try {
      const { data, error } = await this.client.rpc('record_token_activity', {
        p_user_id: userId,
        p_token_id: tokenId,
        p_activity_type: activityType,
        p_metadata: metadata
      });
      
      if (error) {
        console.error('Record token activity error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected record token activity error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while recording token activity') 
      };
    }
  }

  /**
   * Validate a token transfer
   * @private
   */
  private async validateTransfer(
    fromUserId: string, 
    tokenId: string, 
    amount: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    token?: Token;
  }> {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: 'Amount must be positive'
        };
      }

      // Check if token exists and is transferable
      const { data: token, error: tokenError } = await this.client
        .from('tokens')
        .select('*') // Select all fields again to satisfy Token interface and usage
        .eq('id', tokenId)
        .single();

      if (tokenError || !token) {
        return {
          success: false,
          message: 'Token not found'
        };
      }

      if (!token.is_active) {
        return {
          success: false,
          message: 'Token is not active'
        };
      }

      if (!token.is_transferable) {
        return {
          success: false,
          message: 'Token is not transferable'
        };
      }

      const { data: userToken, error: userTokenError } = await this.client
        .from('user_tokens')
        .select('balance')
        .eq('user_id', fromUserId)
        .eq('token_id', tokenId)
        .single();

      if (userTokenError || !userToken) {
        if (userTokenError && userTokenError.code !== 'PGRST116') {
          console.error("ValidateTransfer (Balance Fetch) Error:", userTokenError);
        }
        return { success: false, message: 'User balance record not found for this token' };
      }

      if (userToken.balance < amount) {
        return {
          success: false,
          message: 'Insufficient balance'
        };
      }

      return {
        success: true,
        message: 'Validation successful',
        token
      };
    } catch (error) {
      console.error('Error validating transfer:', error);
      return {
        success: false,
        message: (error as Error).message || 'An unexpected error occurred during validation'
      };
    }
  }
}
