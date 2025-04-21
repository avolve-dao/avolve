/**
 * @ai-anchor #AUTH_FLOW #AUTH_SERVICE
 * @ai-context This service centralizes all authentication-related functionality for the Avolve platform
 * @ai-related-to auth-repository.ts, auth-types.ts
 * 
 * Authentication Service
 * 
 * This service provides a high-level API for authentication-related operations.
 * It implements business logic and delegates database operations to the AuthRepository.
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createUniversalClient } from '@/lib/supabase/universal';
import { 
  User, 
  SupabaseClient,
  AuthError,
  Session
} from '@supabase/supabase-js';
import type { AuthResult, AuthSession, UserProfile, MfaFactor, TotpFactor, RecoveryCodes } from './auth-types';
import { 
  UserSettings, 
  Role, 
  Permission 
} from './auth-types';
import { AuthRepository } from './auth-repository';
import { rateLimit } from '@/lib/rate-limit';

// Export UserProfile and AuthResult for use in other modules
export type { UserProfile, AuthResult } from './auth-types';

// Types moved to ./auth-types for single source of truth

/**
 * Authentication Service Class
 * 
 * This service provides a high-level API for authentication-related operations.
 * It implements business logic and delegates database operations to the AuthRepository.
 */
export class AuthService {
  private repository: AuthRepository;
  private static instance: AuthService;
  private request: NextRequest | null = null;

  /**
   * Private constructor to enforce singleton pattern
   * 
   * @param client - The Supabase client instance
   */
  private constructor(client: SupabaseClient) {
    this.repository = new AuthRepository(client);
  }

  /**
   * Get browser-side instance of the auth service
   * 
   * @returns The singleton instance of the AuthService for browser-side use
   */
  public static getBrowserInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(createClient());
    }
    return AuthService.instance;
  }

  /**
   * Get server-side instance of the auth service
   * 
   * @param request - The NextRequest instance
   * @returns A fresh instance of the AuthService for server-side use
   */
  public static getServerInstance(request: NextRequest): AuthService {
    const instance = new AuthService(createUniversalClient());
    instance.request = request;
    return instance;
  }

  /**
   * Get the Supabase client
   * This is needed for direct access to the client in certain scenarios
   * 
   * @returns The Supabase client instance
   */
  public getSupabaseClient(): SupabaseClient {
    return this.repository.getClient();
  }

  /**
   * Helper method to convert any error to AuthError
   * 
   * @param error - The error to convert
   * @returns An AuthError instance
   */
  private convertToAuthError(error: any): AuthError {
    if (error instanceof AuthError) {
      return error;
    }
    
    return new AuthError(error.message || 'An unexpected error occurred');
  }

  /**
   * Clear rate limit
   * 
   * @param key - The rate limit key
   */
  private async clearRateLimit(key: string): Promise<void> {
    // Rate limit is automatically cleared by LRU cache TTL
  }

  /**
   * Sign in with email and password
   * 
   * @param email - The user's email
   * @param password - The user's password
   * @returns A promise resolving to an AuthResult containing the session
   */
  public async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthResult<AuthSession>> {
    try {
      // Validate inputs
      if (!email || !password) {
        return {
          data: null,
          error: new AuthError('Email and password are required')
        };
      }

      if (!this.request) {
        throw new Error('Request object required for rate limiting');
      }

      // Rate limit check
      const rateLimitKey = `auth:signin:${email}`;
      const { success: withinLimit } = await rateLimit(this.request, {
        uniqueIdentifier: rateLimitKey,
        limit: 5,
        timeframe: 300 // 5 minutes
      });

      if (!withinLimit) {
        return {
          data: null,
          error: new AuthError('Too many sign in attempts. Please try again later.')
        };
      }

      // Sign in with Supabase
      const result = await this.repository.signInWithPassword(email, password);

      // Clear rate limit on success
      if (result.data) {
        await this.clearRateLimit(rateLimitKey);
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        data: null,
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Sign up with email and password
   * 
   * @param email - The user's email
   * @param password - The user's password
   * @param metadata - Optional additional metadata for the user
   * @returns A promise resolving to an AuthResult containing the session
   */
  public async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<AuthResult<AuthSession>> {
    try {
      // Validate inputs
      if (!email || !password) {
        return {
          data: null,
          error: new AuthError('Email and password are required')
        };
      }

      if (!this.request) {
        throw new Error('Request object required for rate limiting');
      }

      if (password.length < 8) {
        return {
          data: null,
          error: new AuthError('Password must be at least 8 characters')
        };
      }

      // Check password strength
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        return {
          data: null,
          error: new AuthError('Password must contain uppercase, lowercase, number, and special character')
        };
      }

      // Rate limit check
      const rateLimitKey = `auth:signup:${email}`;
      const { success: withinLimit } = await rateLimit(this.request, {
        uniqueIdentifier: rateLimitKey,
        limit: 3,
        timeframe: 3600 // 1 hour
      });

      if (!withinLimit) {
        return {
          data: null,
          error: new AuthError('Too many sign up attempts. Please try again later.')
        };
      }

      // Sanitize metadata
      const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : undefined;

      // Sign up with Supabase
      const result = await this.repository.signUp(email, password, safeMetadata);

      // Clear rate limit on success
      if (result.data) {
        await this.clearRateLimit(rateLimitKey);
      }

      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        data: null,
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Reset password
   * 
   * @param email - The user's email
   * @returns A promise resolving to an AuthResult indicating success or failure
   */
  public async resetPassword(email: string): Promise<AuthResult<void>> {
    try {
      // Validate input
      if (!email) {
        return {
          data: null,
          error: new AuthError('Email is required')
        };
      }

      if (!this.request) {
        throw new Error('Request object required for rate limiting');
      }

      // Rate limit check
      const rateLimitKey = `auth:reset:${email}`;
      const { success: withinLimit } = await rateLimit(this.request, {
        uniqueIdentifier: rateLimitKey,
        limit: 3,
        timeframe: 3600 // 1 hour
      });

      if (!withinLimit) {
        return {
          data: null,
          error: new AuthError('Too many password reset attempts. Please try again later.')
        };
      }

      return await this.repository.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        data: null,
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Update password
   * 
   * @param password - The new password
   * @returns A promise resolving to an AuthResult indicating success or failure
   */
  public async updatePassword(password: string): Promise<AuthResult<void>> {
    return this.repository.updatePassword(password);
  }

  /**
   * Sign out the current user
   * 
   * @returns A promise resolving to an AuthResult indicating success or failure
   */
  public async signOut(): Promise<AuthResult<void>> {
    return this.repository.signOut();
  }

  // --- Added for compatibility with use-auth.ts ---
  // TODO: Implement actual logic for these methods as needed

  /**
   * Get user profile by userId
   * @param userId - The user's ID
   * @returns Promise resolving to a UserProfile or null
   */
  public async getUserProfile(userId: string): Promise<AuthResult<UserProfile>> {
    try {
      const { data, error } = await this.repository.getUserProfile(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Get current session
   * @returns Promise resolving to session object or null
   */
  public async getSession(): Promise<AuthResult<{ session: Session | null }>> {
    try {
      const { data, error } = await this.repository.getSession();
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async getUser(): Promise<AuthResult<User>> {
    try {
      const { data, error } = await this.repository.getUser();
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async getUserSettings(userId: string): Promise<AuthResult<UserSettings>> {
    try {
      const { data, error } = await this.repository.getUserSettings(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async getUserRoles(userId: string): Promise<AuthResult<string[]>> {
    try {
      const { data, error } = await this.repository.getUserRoles(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async getUserPermissions(userId: string): Promise<AuthResult<string[]>> {
    try {
      const { data, error } = await this.repository.getUserPermissions(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async hasRole(userId: string, role: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.hasRole(userId, role);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async hasPermission(userId: string, permission: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.hasPermission(userId, permission);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async hasPermissionViaToken(userId: string, permission: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.hasPermissionViaToken(userId, permission);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async getUserSessions(userId: string): Promise<AuthResult<any[]>> {
    try {
      const { data, error } = await this.repository.getUserSessions(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async revokeSession(userId: string, sessionId: string, reason?: string): Promise<AuthResult<boolean>> {
    // Implement logic as needed, stub returns true
    return { data: true, error: null };
  }

  public async revokeAllOtherSessions(userId: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.revokeAllOtherSessions(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async signInWithMagicLink(email: string): Promise<AuthResult<AuthSession>> {
    try {
      const { data, error } = await this.repository.signInWithMagicLink(email);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async updateUserProfile(userId: string, profile: any): Promise<AuthResult<UserProfile>> {
    try {
      const { data, error } = await this.repository.updateUserProfile(userId, profile);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async updateUserSettings(userId: string, settings: any): Promise<AuthResult<UserSettings>> {
    try {
      const { data, error } = await this.repository.updateUserSettings(userId, settings);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  public async updateEmail(userId: string, email: string): Promise<AuthResult<void>> {
    try {
      const { data, error } = await this.repository.updateEmail(userId, email);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Resend confirmation email to user
   * @param email - The user's email
   * @returns Promise resolving to an AuthResult indicating success or failure
   */
  public async resendConfirmationEmail(email: string): Promise<AuthResult<void>> {
    try {
      const { data, error } = await this.repository.resendConfirmationEmail(email);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Update user metadata
   * @param userId - The user's ID
   * @param metadata - Metadata object
   * @returns Promise resolving to an AuthResult indicating success or failure
   */
  public async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<AuthResult<void>> {
    try {
      const { data, error } = await this.repository.updateUserMetadata(userId, metadata);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Check if user is admin
   * @param userId - The user's ID
   * @returns Promise resolving to boolean
   */
  public async isAdmin(userId: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.isAdmin(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Check if MFA is required for user
   * @param userId - The user's ID
   * @returns Promise resolving to boolean
   */
  public async isMfaRequired(userId: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.isMfaRequired(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Get MFA factors for user
   * @param userId - The user's ID
   * @returns Promise resolving to array of MfaFactor
   */
  public async getMfaFactors(userId: string): Promise<AuthResult<MfaFactor[]>> {
    try {
      const { data, error } = await this.repository.getMfaFactors(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Setup TOTP for user
   * @param userId - The user's ID
   * @param friendlyName - Optional friendly name for the TOTP device
   * @returns Promise resolving to TotpFactor
   */
  public async setupTotp(userId: string, friendlyName?: string): Promise<AuthResult<TotpFactor>> {
    try {
      const { data, error } = await this.repository.setupTotp(userId, friendlyName);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Verify TOTP factor for user
   * @param userId - The user's ID
   * @param factorId - The TOTP factor ID
   * @param code - The TOTP code
   * @returns Promise resolving to boolean
   */
  public async verifyTotpFactor(userId: string, factorId: string, code: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.verifyTotpFactor(userId, factorId, code);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Generate recovery codes for user
   * @param userId - The user's ID
   * @param count - Optional number of codes to generate
   * @returns Promise resolving to an array of recovery codes
   */
  public async generateRecoveryCodes(userId: string, count?: number): Promise<AuthResult<string[]>> {
    // Implement logic as needed, stub returns empty array
    return { data: [], error: null };
  }

  /**
   * Verify recovery code for user
   * @param userId - The user's ID
   * @param code - The recovery code
   * @returns Promise resolving to boolean
   */
  public async verifyRecoveryCode(userId: string, code: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.verifyRecoveryCode(userId, code);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }

  /**
   * Disable MFA for user
   * @param userId - The user's ID
   * @returns Promise resolving to boolean
   */
  public async disableMfa(userId: string): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.repository.disableMfa(userId);
      if (error) {
        return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error instanceof AuthError ? error : new AuthError(error.message) };
    }
  }
}
