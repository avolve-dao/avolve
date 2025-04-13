/**
 * @ai-anchor #AUTH_FLOW #AUTH_SERVICE
 * @ai-context This service centralizes all authentication-related functionality for the Avolve platform
 * @ai-related-to auth-repository.ts, auth-types.ts
 * 
 * Authentication Service
 * 
 * This service centralizes all authentication-related functionality for the Avolve platform.
 * It provides methods for user authentication, session management, and security features.
 * 
 * The service follows the repository pattern, delegating database operations to the AuthRepository.
 */

import { NextRequest } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';
import { createUniversalClient } from '@/lib/supabase/universal';
import { 
  User, 
  SupabaseClient,
  AuthError
} from '@supabase/supabase-js';
import { 
  AuthResult, 
  AuthSession 
} from './auth-types';
import { AuthRepository } from './auth-repository';
import { rateLimit } from '@/lib/rate-limit';

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
      AuthService.instance = new AuthService(createBrowserClient());
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
}
