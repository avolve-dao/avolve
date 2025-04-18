/**
 * @ai-anchor #TOKEN_SYSTEM
 * @ai-context This file implements the repository pattern for token-related database operations
 * @ai-related-to TokenService, token-types.ts
 * @ai-database-tables tokens, token_types, user_tokens, token_transactions
 * @ai-sacred-geometry tesla-369
 * 
 * Token Repository
 * 
 * This repository handles all direct database interactions for token-related operations.
 * It follows the repository pattern to separate data access concerns from business logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Token, 
  TokenType, 
  TokenOwnership, 
  TokenTransaction,
  TokenPermission,
  TokenResult,
  TokenError
} from './token-types';

/**
 * TokenRepository class
 * 
 * Handles all direct database interactions for token-related operations.
 * This class follows the repository pattern to separate data access from business logic.
 */
export class TokenRepository {
  /**
   * Creates a new TokenRepository instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Fetches all token types from the database
   * 
   * @returns A promise resolving to a TokenResult containing an array of TokenType objects
   */
  public async getAllTokenTypes(): Promise<TokenResult<TokenType[]>> {
    try {
      const { data, error } = await this.client
        .from('token_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Get all token types error:', error);
        return { 
          data: null, 
          error: new TokenError('Failed to fetch token types', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all token types error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting token types', error) 
      };
    }
  }

  /**
   * Fetches a token type by its ID
   * 
   * @param id - The ID of the token type to fetch
   * @returns A promise resolving to a TokenResult containing a TokenType object
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
        return { 
          data: null, 
          error: new TokenError(`Failed to fetch token type with ID: ${id}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token type by ID error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting token type', error) 
      };
    }
  }

  /**
   * Fetches a token type by its code
   * 
   * @param code - The code of the token type to fetch
   * @returns A promise resolving to a TokenResult containing a TokenType object
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
        return { 
          data: null, 
          error: new TokenError(`Failed to fetch token type with code: ${code}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token type by code error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting token type', error) 
      };
    }
  }

  /**
   * Creates a new token type
   * 
   * @param code - The unique code for the token type
   * @param name - The display name for the token type
   * @param description - Optional description of the token type
   * @param parentTokenTypeId - Optional ID of the parent token type
   * @param metadata - Optional additional metadata for the token type
   * @returns A promise resolving to a TokenResult containing the created TokenType
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
        .insert({
          code,
          name,
          description,
          parent_token_type_id: parentTokenTypeId,
          metadata,
          is_system: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create token type error:', error);
        return { 
          data: null, 
          error: new TokenError('Failed to create token type', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create token type error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while creating token type', error) 
      };
    }
  }

  /**
   * Fetches all tokens from the database
   * 
   * @returns A promise resolving to a TokenResult containing an array of Token objects
   */
  public async getAllTokens(): Promise<TokenResult<Token[]>> {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Get all tokens error:', error);
        return { 
          data: null, 
          error: new TokenError('Failed to fetch tokens', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all tokens error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting tokens', error) 
      };
    }
  }

  /**
   * Fetches tokens by token type
   * 
   * @param tokenTypeId - The ID of the token type to filter by
   * @returns A promise resolving to a TokenResult containing an array of Token objects
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
        return { 
          data: null, 
          error: new TokenError(`Failed to fetch tokens for type ID: ${tokenTypeId}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get tokens by type error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting tokens by type', error) 
      };
    }
  }

  /**
   * Creates a new token
   * 
   * @param tokenTypeId - The ID of the token type
   * @param name - The display name for the token
   * @param symbol - The symbol for the token
   * @param description - Optional description of the token
   * @param isTransferable - Whether the token can be transferred between users
   * @param metadata - Optional additional metadata for the token
   * @returns A promise resolving to a TokenResult containing the created Token
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
        .insert({
          token_type_id: tokenTypeId,
          name,
          symbol,
          description,
          is_transferable: isTransferable,
          is_active: true,
          metadata
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create token error:', error);
        return { 
          data: null, 
          error: new TokenError('Failed to create token', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create token error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while creating token', error) 
      };
    }
  }

  /**
   * Fetches a token by its ID
   * 
   * @param id - The ID of the token to fetch
   * @returns A promise resolving to a TokenResult containing a Token object
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
        return { 
          data: null, 
          error: new TokenError(`Failed to fetch token with ID: ${id}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get token by ID error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting token', error) 
      };
    }
  }

  /**
   * Fetches tokens owned by a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a TokenResult containing an array of TokenOwnership objects
   */
  public async getUserTokens(userId: string): Promise<TokenResult<TokenOwnership[]>> {
    try {
      const { data, error } = await this.client
        .from('user_tokens')
        .select(`
          *,
          tokens:token_id (*)
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Get user tokens error:', error);
        return { 
          data: null, 
          error: new TokenError(`Failed to fetch tokens for user ID: ${userId}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user tokens error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting user tokens', error) 
      };
    }
  }

  /**
   * Fetches a user's token balance
   * 
   * @param userId - The ID of the user
   * @param tokenId - The ID of the token
   * @returns A promise resolving to a TokenResult containing the user's token balance
   */
  public async getUserTokenBalance(userId: string, tokenId: string): Promise<TokenResult<number>> {
    try {
      const { data, error } = await this.client
        .from('user_tokens')
        .select('balance')
        .eq('user_id', userId)
        .eq('token_id', tokenId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return { data: 0, error: null };
        }
        
        console.error('Get user token balance error:', error);
        return { 
          data: null, 
          error: new TokenError(`Failed to fetch token balance for user ID: ${userId} and token ID: ${tokenId}`, error) 
        };
      }
      
      return { data: data.balance, error: null };
    } catch (error) {
      console.error('Unexpected get user token balance error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting user token balance', error) 
      };
    }
  }

  /**
   * Creates a token transaction
   * 
   * @param transaction - The transaction data to create
   * @returns A promise resolving to a TokenResult containing the created TokenTransaction
   */
  public async createTransaction(transaction: Partial<TokenTransaction>): Promise<TokenResult<TokenTransaction>> {
    try {
      const { data, error } = await this.client
        .from('token_transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) {
        console.error('Create transaction error:', error);
        return { 
          data: null, 
          error: new TokenError('Failed to create transaction', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create transaction error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while creating transaction', error) 
      };
    }
  }

  /**
   * Updates a user's token balance
   * 
   * @param userId - The ID of the user
   * @param tokenId - The ID of the token
   * @param amount - The amount to add to the balance (can be negative)
   * @returns A promise resolving to a TokenResult containing the updated balance
   */
  public async updateUserTokenBalance(userId: string, tokenId: string, amount: number): Promise<TokenResult<number>> {
    try {
      // First check if the user already has this token
      const { data: existingToken, error: checkError } = await this.client
        .from('user_tokens')
        .select('id, balance')
        .eq('user_id', userId)
        .eq('token_id', tokenId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check user token error:', checkError);
        return { 
          data: null, 
          error: new TokenError('Failed to check user token balance', checkError) 
        };
      }
      
      let result;
      
      if (existingToken) {
        // Update existing balance
        const newBalance = existingToken.balance + amount;
        
        // Ensure balance doesn't go below zero
        if (newBalance < 0) {
          return {
            data: null,
            error: new TokenError('Insufficient balance', { message: 'Balance cannot go below zero' })
          };
        }
        
        const { data, error } = await this.client
          .from('user_tokens')
          .update({ balance: newBalance })
          .eq('id', existingToken.id)
          .select('balance')
          .single();
        
        if (error) {
          console.error('Update user token balance error:', error);
          return { 
            data: null, 
            error: new TokenError('Failed to update user token balance', error) 
          };
        }
        
        result = { data: data.balance, error: null };
      } else {
        // Create new user token record
        if (amount < 0) {
          return {
            data: null,
            error: new TokenError('Invalid amount', { message: 'Cannot create user token with negative balance' })
          };
        }
        
        const { data, error } = await this.client
          .from('user_tokens')
          .insert({
            user_id: userId,
            token_id: tokenId,
            balance: amount
          })
          .select('balance')
          .single();
        
        if (error) {
          console.error('Create user token balance error:', error);
          return { 
            data: null, 
            error: new TokenError('Failed to create user token balance', error) 
          };
        }
        
        result = { data: data.balance, error: null };
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected update user token balance error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while updating user token balance', error) 
      };
    }
  }

  /**
   * Checks if a user has permission via token
   * 
   * @param userId - The ID of the user
   * @param resource - The resource to check permission for
   * @param action - The action to check permission for
   * @returns A promise resolving to a TokenResult containing a boolean indicating if the user has permission
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
        return { 
          data: null, 
          error: new TokenError('Failed to check permission via token', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected check permission via token error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while checking permission via token', error) 
      };
    }
  }

  /**
   * Records token activity
   * 
   * @param userId - The ID of the user (can be null for system activities)
   * @param tokenId - The ID of the token (can be null for general activities)
   * @param activityType - The type of activity
   * @param metadata - Optional additional metadata for the activity
   * @returns A promise resolving to a TokenResult containing the ID of the created activity record
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
        return { 
          data: null, 
          error: new TokenError('Failed to record token activity', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected record token activity error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while recording token activity', error) 
      };
    }
  }
}
