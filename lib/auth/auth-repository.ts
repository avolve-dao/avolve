/**
 * @ai-anchor #AUTH_REPOSITORY
 * @ai-context This repository centralizes all authentication-related database operations for the Avolve platform
 * @ai-related-to auth-service.ts, auth-types.ts
 * 
 * Authentication Repository
 * 
 * This repository centralizes all authentication-related database operations for the Avolve platform.
 * It provides methods for user authentication, session management, and security features.
 * 
 * The repository follows the repository pattern, providing a clean abstraction over the Supabase client.
 */

import { SupabaseClient, AuthError } from '@supabase/supabase-js';
import { AuthResult, AuthSession } from './auth-types';

/**
 * Authentication Repository Class
 * 
 * This repository provides a low-level API for authentication-related database operations.
 * It handles direct interactions with the Supabase client.
 */
export class AuthRepository {
  private client: SupabaseClient;

  /**
   * Constructor
   * 
   * @param client - The Supabase client instance
   */
  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get the Supabase client
   * 
   * @returns The Supabase client instance
   */
  public getClient(): SupabaseClient {
    return this.client;
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
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error instanceof AuthError ? error : new AuthError(error.message)
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
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error instanceof AuthError ? error : new AuthError(error.message)
      };
    }
  }

  /**
   * Sign out the current user
   * 
   * @returns A promise resolving to an AuthResult indicating success or failure
   */
  public async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        return { data: null, error };
      }

      return { data: void 0, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error instanceof AuthError ? error : new AuthError(error.message)
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
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { data: null, error };
      }

      return { data: void 0, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error instanceof AuthError ? error : new AuthError(error.message)
      };
    }
  }

  /**
   * Update password
   * 
   * @param password - The new password
   * @returns A promise resolving to an AuthResult containing the updated user
   */
  public async updatePassword(password: string): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.updateUser({
        password
      });

      if (error) {
        return { data: null, error };
      }

      return { data: void 0, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error instanceof AuthError ? error : new AuthError(error.message)
      };
    }
  }
}
