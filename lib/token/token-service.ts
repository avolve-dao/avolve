/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_SERVICE
 * @ai-context This service centralizes all token management functionality for the Avolve platform
 * @ai-related-to token-repository.ts, token-types.ts
 * @ai-database-tables tokens, token_types, user_tokens, token_transactions
 * @ai-sacred-geometry tesla-369
 * 
 * Token Service
 * 
 * This service centralizes all token management functionality for the Avolve platform.
 * It provides methods for managing tokens, token ownership, and token-based permissions.
 * 
 * The service follows the repository pattern, delegating database operations to the TokenRepository.
 * It implements sacred geometry principles, particularly Tesla's 3-6-9 pattern, in token calculations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Token, 
  TokenType, 
  TokenOwnership, 
  TokenTransaction,
  TokenPermission,
  TokenResult,
  TokenError,
  TransactionStatus,
  TransactionType,
  DailyToken,
  DAY_TO_TOKEN_MAP
} from './token-types';
import { TokenRepository } from './token-repository';

/**
 * Token Service Class
 * 
 * This service provides a high-level API for token-related operations.
 * It implements business logic and delegates database operations to the TokenRepository.
 */
export class TokenService {
  private repository: TokenRepository;
  
  /**
   * Creates a new TokenService instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(client: SupabaseClient) {
    this.repository = new TokenRepository(client);
  }

  /**
   * Get all token types
   * 
   * @returns A promise resolving to a TokenResult containing an array of TokenType objects
   */
  public async getAllTokenTypes(): Promise<TokenResult<TokenType[]>> {
    return this.repository.getAllTokenTypes();
  }

  /**
   * Get a token type by ID
   * 
   * @param id - The ID of the token type to fetch
   * @returns A promise resolving to a TokenResult containing a TokenType object
   */
  public async getTokenTypeById(id: string): Promise<TokenResult<TokenType>> {
    return this.repository.getTokenTypeById(id);
  }

  /**
   * Get a token type by code
   * 
   * @param code - The code of the token type to fetch (e.g., GEN, SAP, PSP)
   * @returns A promise resolving to a TokenResult containing a TokenType object
   */
  public async getTokenTypeByCode(code: string): Promise<TokenResult<TokenType>> {
    return this.repository.getTokenTypeByCode(code);
  }

  /**
   * Create a new token type
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
    return this.repository.createTokenType(code, name, description, parentTokenTypeId, metadata);
  }

  /**
   * Get all tokens
   * 
   * @returns A promise resolving to a TokenResult containing an array of Token objects
   */
  public async getAllTokens(): Promise<TokenResult<Token[]>> {
    return this.repository.getAllTokens();
  }

  /**
   * Get tokens by token type
   * 
   * @param tokenTypeId - The ID of the token type to filter by
   * @returns A promise resolving to a TokenResult containing an array of Token objects
   */
  public async getTokensByType(tokenTypeId: string): Promise<TokenResult<Token[]>> {
    return this.repository.getTokensByType(tokenTypeId);
  }

  /**
   * Create a new token
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
    return this.repository.createToken(tokenTypeId, name, symbol, description, isTransferable, metadata);
  }

  /**
   * Get token by ID
   * 
   * @param id - The ID of the token to fetch
   * @returns A promise resolving to a TokenResult containing a Token object
   */
  public async getTokenById(id: string): Promise<TokenResult<Token>> {
    return this.repository.getTokenById(id);
  }

  /**
   * Get tokens owned by a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a TokenResult containing an array of TokenOwnership objects
   */
  public async getUserTokens(userId: string): Promise<TokenResult<TokenOwnership[]>> {
    return this.repository.getUserTokens(userId);
  }

  /**
   * Get a user's token balance
   * 
   * @param userId - The ID of the user
   * @param tokenId - The ID of the token
   * @returns A promise resolving to a TokenResult containing the user's token balance
   */
  public async getUserTokenBalance(userId: string, tokenId: string): Promise<TokenResult<number>> {
    return this.repository.getUserTokenBalance(userId, tokenId);
  }

  /**
   * Transfer tokens from one user to another
   * 
   * @param fromUserId - The ID of the user sending tokens
   * @param toUserId - The ID of the user receiving tokens
   * @param tokenId - The ID of the token to transfer
   * @param amount - The amount of tokens to transfer
   * @param reason - Optional reason for the transfer
   * @returns A promise resolving to a TokenResult containing the transaction result
   */
  public async transferTokens(
    fromUserId: string, 
    toUserId: string, 
    tokenId: string, 
    amount: number,
    reason?: string
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      // Validate the transfer
      const validationResult = await this.validateTransfer(fromUserId, tokenId, amount);
      
      if (!validationResult.success) {
        return { 
          data: { success: false, message: validationResult.message }, 
          error: null 
        };
      }
      
      // Create the transaction
      const { data: transaction, error: transactionError } = await this.repository.createTransaction({
        token_id: tokenId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        transaction_type: TransactionType.TRANSFER,
        status: TransactionStatus.PENDING,
        reason
      });
      
      if (transactionError) {
        return { 
          data: { success: false, message: 'Failed to create transaction' }, 
          error: transactionError 
        };
      }
      
      // Update sender's balance
      const { error: fromError } = await this.repository.updateUserTokenBalance(
        fromUserId, 
        tokenId, 
        -amount
      );
      
      if (fromError) {
        // Revert transaction status
        await this.repository.createTransaction({
          ...transaction,
          status: TransactionStatus.FAILED,
          metadata: { 
            error: 'Failed to update sender balance',
            original_transaction_id: transaction.id
          }
        });
        
        return { 
          data: { success: false, message: 'Failed to update sender balance' }, 
          error: fromError 
        };
      }
      
      // Update receiver's balance
      const { error: toError } = await this.repository.updateUserTokenBalance(
        toUserId, 
        tokenId, 
        amount
      );
      
      if (toError) {
        // Revert sender's balance
        await this.repository.updateUserTokenBalance(fromUserId, tokenId, amount);
        
        // Revert transaction status
        await this.repository.createTransaction({
          ...transaction,
          status: TransactionStatus.FAILED,
          metadata: { 
            error: 'Failed to update receiver balance',
            original_transaction_id: transaction.id
          }
        });
        
        return { 
          data: { success: false, message: 'Failed to update receiver balance' }, 
          error: toError 
        };
      }
      
      // Update transaction status to completed
      await this.repository.createTransaction({
        ...transaction,
        status: TransactionStatus.COMPLETED
      });
      
      // Record activity
      await this.repository.recordTokenActivity(
        fromUserId,
        tokenId,
        'transfer_sent',
        { amount, to_user_id: toUserId }
      );
      
      await this.repository.recordTokenActivity(
        toUserId,
        tokenId,
        'transfer_received',
        { amount, from_user_id: fromUserId }
      );
      
      return { 
        data: { 
          success: true, 
          message: 'Transfer completed successfully', 
          transaction_id: transaction.id 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected transfer tokens error:', error);
      return { 
        data: { success: false, message: 'An unexpected error occurred during transfer' }, 
        error: new TokenError('An unexpected error occurred during transfer', error) 
      };
    }
  }

  /**
   * Mint new tokens for a user
   * 
   * @param toUserId - The ID of the user receiving tokens
   * @param tokenId - The ID of the token to mint
   * @param amount - The amount of tokens to mint
   * @param reason - Optional reason for minting
   * @returns A promise resolving to a TokenResult containing the transaction result
   */
  public async mintTokens(
    toUserId: string, 
    tokenId: string, 
    amount: number,
    reason?: string
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      if (amount <= 0) {
        return { 
          data: { success: false, message: 'Amount must be positive' }, 
          error: null 
        };
      }
      
      // Check if token exists and is active
      const { data: token, error: tokenError } = await this.repository.getTokenById(tokenId);
      
      if (tokenError || !token) {
        return { 
          data: { success: false, message: 'Token not found' }, 
          error: tokenError 
        };
      }
      
      if (!token.is_active) {
        return { 
          data: { success: false, message: 'Token is not active' }, 
          error: null 
        };
      }
      
      // Create the transaction
      const { data: transaction, error: transactionError } = await this.repository.createTransaction({
        token_id: tokenId,
        to_user_id: toUserId,
        amount,
        transaction_type: TransactionType.MINT,
        status: TransactionStatus.PENDING,
        reason
      });
      
      if (transactionError) {
        return { 
          data: { success: false, message: 'Failed to create transaction' }, 
          error: transactionError 
        };
      }
      
      // Update user's balance
      const { error: updateError } = await this.repository.updateUserTokenBalance(
        toUserId, 
        tokenId, 
        amount
      );
      
      if (updateError) {
        // Revert transaction status
        await this.repository.createTransaction({
          ...transaction,
          status: TransactionStatus.FAILED,
          metadata: { 
            error: 'Failed to update user balance',
            original_transaction_id: transaction.id
          }
        });
        
        return { 
          data: { success: false, message: 'Failed to update user balance' }, 
          error: updateError 
        };
      }
      
      // Update transaction status to completed
      await this.repository.createTransaction({
        ...transaction,
        status: TransactionStatus.COMPLETED
      });
      
      // Record activity
      await this.repository.recordTokenActivity(
        toUserId,
        tokenId,
        'tokens_minted',
        { amount }
      );
      
      return { 
        data: { 
          success: true, 
          message: 'Tokens minted successfully', 
          transaction_id: transaction.id 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected mint tokens error:', error);
      return { 
        data: { success: false, message: 'An unexpected error occurred during minting' }, 
        error: new TokenError('An unexpected error occurred during minting', error) 
      };
    }
  }

  /**
   * Burn tokens from a user
   * 
   * @param fromUserId - The ID of the user whose tokens will be burned
   * @param tokenId - The ID of the token to burn
   * @param amount - The amount of tokens to burn
   * @param reason - Optional reason for burning
   * @returns A promise resolving to a TokenResult containing the transaction result
   */
  public async burnTokens(
    fromUserId: string, 
    tokenId: string, 
    amount: number,
    reason?: string
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      // Validate the burn
      const validationResult = await this.validateTransfer(fromUserId, tokenId, amount);
      
      if (!validationResult.success) {
        return { 
          data: { success: false, message: validationResult.message }, 
          error: null 
        };
      }
      
      // Create the transaction
      const { data: transaction, error: transactionError } = await this.repository.createTransaction({
        token_id: tokenId,
        from_user_id: fromUserId,
        amount,
        transaction_type: TransactionType.BURN,
        status: TransactionStatus.PENDING,
        reason
      });
      
      if (transactionError) {
        return { 
          data: { success: false, message: 'Failed to create transaction' }, 
          error: transactionError 
        };
      }
      
      // Update user's balance
      const { error: updateError } = await this.repository.updateUserTokenBalance(
        fromUserId, 
        tokenId, 
        -amount
      );
      
      if (updateError) {
        // Revert transaction status
        await this.repository.createTransaction({
          ...transaction,
          status: TransactionStatus.FAILED,
          metadata: { 
            error: 'Failed to update user balance',
            original_transaction_id: transaction.id
          }
        });
        
        return { 
          data: { success: false, message: 'Failed to update user balance' }, 
          error: updateError 
        };
      }
      
      // Update transaction status to completed
      await this.repository.createTransaction({
        ...transaction,
        status: TransactionStatus.COMPLETED
      });
      
      // Record activity
      await this.repository.recordTokenActivity(
        fromUserId,
        tokenId,
        'tokens_burned',
        { amount }
      );
      
      return { 
        data: { 
          success: true, 
          message: 'Tokens burned successfully', 
          transaction_id: transaction.id 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected burn tokens error:', error);
      return { 
        data: { success: false, message: 'An unexpected error occurred during burning' }, 
        error: new TokenError('An unexpected error occurred during burning', error) 
      };
    }
  }

  /**
   * Check if a user has permission via token
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
    return this.repository.hasPermissionViaToken(userId, resource, action);
  }

  /**
   * Record token activity
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
    return this.repository.recordTokenActivity(userId, tokenId, activityType, metadata);
  }

  /**
   * Get the daily token for the current day
   * 
   * @returns A promise resolving to a TokenResult containing the daily token
   */
  public async getDailyToken(): Promise<TokenResult<DailyToken>> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0-6, Sunday-Saturday
      const tokenSymbol = DAY_TO_TOKEN_MAP[dayOfWeek];
      
      const { data: tokenType, error } = await this.repository.getTokenTypeByCode(tokenSymbol);
      
      if (error) {
        return { 
          data: null, 
          error 
        };
      }
      
      // Get the first token of this type
      const { data: tokens, error: tokensError } = await this.repository.getTokensByType(tokenType.id);
      
      if (tokensError || !tokens || tokens.length === 0) {
        return { 
          data: null, 
          error: tokensError || new TokenError(`No tokens found for type ${tokenSymbol}`) 
        };
      }
      
      const token = tokens[0];
      
      // Apply sacred geometry principles
      const digitalRoot = this.calculateDigitalRoot(dayOfWeek);
      const isTesla369 = [3, 6, 9].includes(digitalRoot);
      
      const dailyToken: DailyToken = {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        day_of_week: dayOfWeek,
        gradient: token.gradient || this.getGradientForDay(dayOfWeek),
        is_tesla_369: isTesla369
      };
      
      return { data: dailyToken, error: null };
    } catch (error) {
      console.error('Unexpected get daily token error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting daily token', error) 
      };
    }
  }

  /**
   * Calculate the Tesla 3-6-9 digital root of a number
   * 
   * @param num - The number to calculate the digital root for
   * @returns The digital root (3, 6, or 9)
   */
  private calculateDigitalRoot(num: number): number {
    // Sum the digits until we get a single digit
    while (num > 9) {
      num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    
    // Map to Tesla's 3-6-9 pattern
    if (num === 3 || num === 6 || num === 9) {
      return num; // Already a Tesla number
    } else if ([1, 4, 7].includes(num)) {
      return 3; // Maps to 3
    } else if ([2, 5, 8].includes(num)) {
      return 6; // Maps to 6
    } else {
      return 9; // Default to 9
    }
  }

  /**
   * Get the gradient for a day of the week
   * 
   * @param dayOfWeek - The day of the week (0-6, Sunday-Saturday)
   * @returns The CSS gradient for the day
   */
  private getGradientForDay(dayOfWeek: number): string {
    const gradients = {
      0: 'linear-gradient(to right, #ff0000, #00ff00, #0000ff)', // Sunday: SPD - Red-Green-Blue
      1: 'linear-gradient(to right, #ff9a9e, #ff0844, #ff8c00)', // Monday: SHE - Rose-Red-Orange
      2: 'linear-gradient(to right, #ffbf00, #ffff00)', // Tuesday: PSP - Amber-Yellow
      3: 'linear-gradient(to right, #b2ff59, #00e676, #00bfa5)', // Wednesday: SSA - Lime-Green-Emerald
      4: 'linear-gradient(to right, #20c997, #00b8d4)', // Thursday: BSP - Teal-Cyan
      5: 'linear-gradient(to right, #87ceeb, #1e90ff, #4b0082)', // Friday: SGB - Sky-Blue-Indigo
      6: 'linear-gradient(to right, #ee82ee, #9c27b0, #ff00ff, #ff69b4)' // Saturday: SMS - Violet-Purple-Fuchsia-Pink
    };
    
    return gradients[dayOfWeek] || 'linear-gradient(to right, #808080, #a9a9a9)';
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
      const { data: token, error: tokenError } = await this.repository.getTokenById(tokenId);

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

      const { data: balance, error: balanceError } = await this.repository.getUserTokenBalance(fromUserId, tokenId);

      if (balanceError) {
        return {
          success: false,
          message: 'Failed to retrieve user balance'
        };
      }

      if (balance < amount) {
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

  /**
   * Claim daily token
   * 
   * @param userId - The ID of the user claiming the token
   * @param tokenId - The ID of the token to claim
   * @param amount - The amount of tokens to claim
   * @returns A promise resolving to a TokenResult containing the claim result
   */
  public async claimDailyToken(
    userId: string,
    tokenId: string,
    amount: number
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    try {
      // Validate the claim
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
      
      // Get token details
      const { data: token, error: tokenError } = await this.repository.getTokenById(tokenId);
      
      if (tokenError || !token) {
        console.error('Token not found error:', tokenError);
        return { 
          data: { success: false, message: 'Token not found' }, 
          error: new TokenError('Token not found', tokenError) 
        };
      }
      
      // Check if this is the correct day for this token
      const expectedTokenSymbol = DAY_TO_TOKEN_MAP[dayOfWeek];
      if (token.symbol !== expectedTokenSymbol) {
        return { 
          data: { 
            success: false, 
            message: `This token can only be claimed on ${this.getDayForToken(token.symbol)}` 
          }, 
          error: null 
        };
      }
      
      // Check if user has already claimed this token today
      const { data: hasClaimedToday, error: claimCheckError } = await this.hasUserClaimedTokenToday(userId, tokenId);
      
      if (claimCheckError) {
        console.error('Claim check error:', claimCheckError);
        return { 
          data: { success: false, message: 'Failed to check previous claims' }, 
          error: claimCheckError 
        };
      }
      
      if (hasClaimedToday) {
        return { 
          data: { 
            success: false, 
            message: `You have already claimed ${token.symbol} today. Come back tomorrow!` 
          }, 
          error: null 
        };
      }
      
      // Apply Tesla's 3-6-9 pattern for streak bonuses
      const { data: streak, error: streakError } = await this.getUserTokenStreak(userId, tokenId);
      let bonusMultiplier = 1.0;
      
      if (!streakError && streak) {
        // Apply Tesla's 3-6-9 pattern
        if (streak % 9 === 0) {
          bonusMultiplier = 3.0; // Triple bonus at multiples of 9
        } else if (streak % 6 === 0) {
          bonusMultiplier = 2.0; // Double bonus at multiples of 6
        } else if (streak % 3 === 0) {
          bonusMultiplier = 1.5; // 50% bonus at multiples of 3
        }
      }
      
      const adjustedAmount = amount * bonusMultiplier;
      
      // Mint the tokens
      const { data: mintResult, error: mintError } = await this.mintTokens(
        userId, 
        tokenId, 
        adjustedAmount, 
        'Daily token claim'
      );
      
      if (mintError || !mintResult.success) {
        console.error('Mint error:', mintError);
        return { 
          data: { success: false, message: 'Failed to mint tokens' }, 
          error: mintError 
        };
      }
      
      // Record the claim
      const { error: recordError } = await this.repository.recordTokenClaim(
        userId,
        tokenId,
        adjustedAmount,
        bonusMultiplier > 1 ? `Streak bonus: x${bonusMultiplier}` : undefined
      );
      
      if (recordError) {
        console.error('Record claim error:', recordError);
        // Don't fail the whole operation if just the recording fails
      }
      
      // Update streak
      await this.repository.updateTokenStreak(userId, tokenId);
      
      return { 
        data: { 
          success: true, 
          message: bonusMultiplier > 1 
            ? `Claimed ${adjustedAmount} ${token.symbol} tokens with a x${bonusMultiplier} streak bonus!` 
            : `Claimed ${adjustedAmount} ${token.symbol} tokens!`,
          transaction_id: mintResult.transaction_id
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected claim daily token error:', error);
      return { 
        data: { success: false, message: 'An unexpected error occurred while claiming token' }, 
        error: new TokenError('An unexpected error occurred while claiming token', error) 
      };
    }
  }

  /**
   * Claim challenge reward
   * 
   * @param userId - The ID of the user claiming the reward
   * @param tokenId - The ID of the token to claim
   * @param amount - The amount of tokens to claim
   * @param challengeId - The ID of the completed challenge
   * @returns A promise resolving to a TokenResult containing the claim result
   */
  public async claimChallengeReward(
    userId: string,
    tokenId: string,
    amount: number,
    challengeId: string
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string; unlocked?: boolean }>> {
    try {
      // Get token details
      const { data: token, error: tokenError } = await this.repository.getTokenById(tokenId);
      
      if (tokenError || !token) {
        console.error('Token not found error:', tokenError);
        return { 
          data: { success: false, message: 'Token not found' }, 
          error: new TokenError('Token not found', tokenError) 
        };
      }
      
      // Check if user has already claimed this challenge
      const { data: hasClaimedChallenge, error: claimCheckError } = 
        await this.repository.hasUserClaimedChallenge(userId, challengeId);
      
      if (claimCheckError) {
        console.error('Challenge claim check error:', claimCheckError);
        return { 
          data: { success: false, message: 'Failed to check previous claims' }, 
          error: claimCheckError 
        };
      }
      
      if (hasClaimedChallenge) {
        return { 
          data: { 
            success: false, 
            message: `You have already claimed the reward for this challenge` 
          }, 
          error: null 
        };
      }
      
      // Apply Tesla's 3-6-9 pattern for streak bonuses
      const { data: streak, error: streakError } = await this.getUserTokenStreak(userId, tokenId);
      let bonusMultiplier = 1.0;
      
      if (!streakError && streak) {
        // Apply Tesla's 3-6-9 pattern
        if (streak % 9 === 0) {
          bonusMultiplier = 3.0; // Triple bonus at multiples of 9
        } else if (streak % 6 === 0) {
          bonusMultiplier = 2.0; // Double bonus at multiples of 6
        } else if (streak % 3 === 0) {
          bonusMultiplier = 1.5; // 50% bonus at multiples of 3
        }
      }
      
      const adjustedAmount = amount * bonusMultiplier;
      
      // Check if this token is locked for the user
      const { data: isLocked, error: lockCheckError } = 
        await this.repository.isTokenLockedForUser(userId, tokenId);
      
      if (lockCheckError) {
        console.error('Lock check error:', lockCheckError);
        // Continue anyway, don't fail the whole operation
      }
      
      let unlocked = false;
      
      // Mint the tokens
      const { data: mintResult, error: mintError } = await this.mintTokens(
        userId, 
        tokenId, 
        adjustedAmount, 
        `Challenge reward: ${challengeId}`
      );
      
      if (mintError || !mintResult.success) {
        console.error('Mint error:', mintError);
        return { 
          data: { success: false, message: 'Failed to mint tokens' }, 
          error: mintError 
        };
      }
      
      // Record the claim
      const { error: recordError } = await this.repository.recordChallengeReward(
        userId,
        tokenId,
        challengeId,
        adjustedAmount,
        bonusMultiplier > 1 ? `Streak bonus: x${bonusMultiplier}` : undefined
      );
      
      if (recordError) {
        console.error('Record challenge reward error:', recordError);
        // Don't fail the whole operation if just the recording fails
      }
      
      // Check if we need to unlock the token
      if (isLocked) {
        // Get user's total balance for this token
        const { data: balance, error: balanceError } = 
          await this.repository.getUserTokenBalance(userId, tokenId);
        
        if (!balanceError && balance >= 50) { // Threshold for unlocking
          // Unlock the token
          const { error: unlockError } = await this.repository.unlockTokenForUser(userId, tokenId);
          
          if (!unlockError) {
            unlocked = true;
          }
        }
      }
      
      // Update streak
      await this.repository.updateTokenStreak(userId, tokenId);
      
      return { 
        data: { 
          success: true, 
          message: bonusMultiplier > 1 
            ? `Earned ${adjustedAmount} ${token.symbol} tokens with a x${bonusMultiplier} streak bonus!` 
            : `Earned ${adjustedAmount} ${token.symbol} tokens!`,
          transaction_id: mintResult.transaction_id,
          unlocked
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected claim challenge reward error:', error);
      return { 
        data: { success: false, message: 'An unexpected error occurred while claiming reward' }, 
        error: new TokenError('An unexpected error occurred while claiming reward', error) 
      };
    }
  }

  /**
   * Get user token balances with additional information
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a TokenResult containing an array of TokenBalance objects
   */
  public async getUserTokenBalances(userId: string): Promise<TokenResult<TokenBalance[]>> {
    try {
      const { data: ownerships, error } = await this.repository.getUserTokens(userId);
      
      if (error) {
        console.error('Get user token balances error:', error);
        return { data: null, error };
      }
      
      if (!ownerships || ownerships.length === 0) {
        return { data: [], error: null };
      }
      
      // Get token details for each ownership
      const balances: TokenBalance[] = [];
      
      for (const ownership of ownerships) {
        const { data: token, error: tokenError } = await this.repository.getTokenById(ownership.token_id);
        
        if (tokenError || !token) {
          console.error(`Error fetching token ${ownership.token_id}:`, tokenError);
          continue;
        }
        
        balances.push({
          token_id: token.id,
          token_name: token.name,
          token_symbol: token.symbol,
          amount: ownership.amount,
          is_locked: ownership.is_locked,
          level: Math.floor(ownership.amount / 100) + 1, // Level increases every 100 tokens
          last_claimed: ownership.last_claimed
        });
      }
      
      return { data: balances, error: null };
    } catch (error) {
      console.error('Unexpected get user token balances error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting user token balances', error) 
      };
    }
  }

  /**
   * Get day name for a token symbol
   * 
   * @param tokenSymbol - The token symbol
   * @returns The day name for the token
   */
  private getDayForToken(tokenSymbol: string): string {
    switch (tokenSymbol) {
      case 'SPD': return 'Sunday';
      case 'SHE': return 'Monday';
      case 'PSP': return 'Tuesday';
      case 'SSA': return 'Wednesday';
      case 'BSP': return 'Thursday';
      case 'SGB': return 'Friday';
      case 'SMS': return 'Saturday';
      default: return 'Unknown day';
    }
  }
}
