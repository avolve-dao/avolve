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

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createUniversalClient } from '@/lib/supabase/universal';
import { 
  User, 
  SupabaseClient,
  AuthError
} from '@supabase/supabase-js';
import { 
  AuthResult, 
  UserProfile, 
  UserSettings,
  AuthSession,
  MfaFactorType,
  MfaFactor,
  TotpFactor,
  RecoveryCodes,
  UserSession,
  Role,
  Permission,
  UserPermission,
  AuthProvider,
  AuthEvent,
  AuthRole,
  TokenPermission
} from './auth-types';
import { AuthRepository } from './auth-repository';

/**
 * Authentication Service Class
 * 
 * This service provides a high-level API for authentication-related operations.
 * It implements business logic and delegates database operations to the AuthRepository.
 */
export class AuthService {
  private repository: AuthRepository;
  private static instance: AuthService;

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
   * @returns A fresh instance of the AuthService for server-side use
   */
  public static getServerInstance(): AuthService {
    // Server-side instance is always created fresh to ensure correct cookie handling
    return new AuthService(createUniversalClient());
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
    return this.repository.signInWithPassword(email, password);
  }

  /**
   * Sign in with OAuth provider
   * 
   * @param provider - The OAuth provider to use
   * @param redirectTo - Optional URL to redirect to after authentication
   * @returns A promise resolving to an AuthResult containing the URL to redirect to
   */
  public async signInWithOAuth(
    provider: AuthProvider,
    redirectTo?: string
  ): Promise<AuthResult<{ url: string }>> {
    try {
      const { data, error } = await this.getSupabaseClient().auth.signInWithOAuth({
        provider: provider as any,
        options: redirectTo ? { redirectTo } : undefined
      });
      
      if (error) {
        console.error('Sign in with OAuth error:', error);
        return { data: null, error };
      }
      
      return { data: { url: data.url }, error: null };
    } catch (error: any) {
      console.error('Unexpected sign in with OAuth error:', error);
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
    return this.repository.signUp(email, password, metadata);
  }

  /**
   * Sign out the current user
   * 
   * @returns A promise resolving to an AuthResult indicating success or failure
   */
  public async signOut(): Promise<AuthResult<void>> {
    return this.repository.signOut();
  }

  /**
   * Get the current user
   * 
   * @returns A promise resolving to an AuthResult containing the current user
   */
  public async getUser(): Promise<AuthResult<User | null>> {
    return this.repository.getCurrentUser();
  }

  /**
   * Get the current session
   * 
   * @returns A promise resolving to an AuthResult containing the current session
   */
  public async getSession(): Promise<AuthResult<AuthSession | null>> {
    return this.repository.getSession();
  }

  /**
   * Reset password
   * 
   * @param email - The user's email
   * @returns A promise resolving to an AuthResult indicating success or failure
   */
  public async resetPassword(email: string): Promise<AuthResult<void>> {
    return this.repository.resetPassword(email);
  }

  /**
   * Update password
   * 
   * @param password - The new password
   * @returns A promise resolving to an AuthResult containing the updated user
   */
  public async updatePassword(password: string): Promise<AuthResult<User>> {
    return this.repository.updatePassword(password);
  }

  /**
   * Get the user's profile
   * 
   * @param userId - The user's ID (defaults to the current user)
   * @returns A promise resolving to an AuthResult containing the user's profile
   */
  public async getUserProfile(userId?: string): Promise<AuthResult<UserProfile>> {
    try {
      if (!userId) {
        const { data: user, error: userError } = await this.getUser();
        
        if (userError || !user) {
          return { 
            data: null, 
            error: userError || new AuthError('User not authenticated')
          };
        }
        
        userId = user.id;
      }
      
      return this.repository.getUserProfile(userId);
    } catch (error: any) {
      console.error('Unexpected get user profile error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Update the user's profile
   * 
   * @param profile - The updated profile data
   * @param userId - The user's ID (defaults to the current user)
   * @returns A promise resolving to an AuthResult containing the updated profile
   */
  public async updateUserProfile(
    profile: Partial<UserProfile>,
    userId?: string
  ): Promise<AuthResult<UserProfile>> {
    try {
      if (!userId) {
        const { data: user, error: userError } = await this.getUser();
        
        if (userError || !user) {
          return { 
            data: null, 
            error: userError || new AuthError('User not authenticated')
          };
        }
        
        userId = user.id;
      }
      
      return this.repository.updateUserProfile(userId, profile);
    } catch (error: any) {
      console.error('Unexpected update user profile error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Check if a user has permission via token
   * 
   * @param resource - The resource to check permission for
   * @param action - The action to check permission for
   * @param userId - The user's ID (defaults to the current user)
   * @returns A promise resolving to an AuthResult containing a boolean indicating if the user has permission
   */
  public async hasPermissionViaToken(
    resource: string,
    action: string,
    userId?: string
  ): Promise<AuthResult<boolean>> {
    try {
      if (!userId) {
        const { data: user, error: userError } = await this.getUser();
        
        if (userError || !user) {
          return { 
            data: null, 
            error: userError || new AuthError('User not authenticated')
          };
        }
        
        userId = user.id;
      }
      
      return this.repository.hasPermissionViaToken(userId, resource, action);
    } catch (error: any) {
      console.error('Unexpected has permission via token error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Get all token-based permissions for a user
   * 
   * @param userId - The user's ID (defaults to the current user)
   * @returns A promise resolving to an AuthResult containing an array of permissions with their status
   */
  public async getTokenPermissions(
    userId?: string
  ): Promise<AuthResult<TokenPermission[]>> {
    try {
      if (!userId) {
        const { data: user, error: userError } = await this.getUser();
        
        if (userError || !user) {
          return { 
            data: null, 
            error: userError || new AuthError('User not authenticated')
          };
        }
        
        userId = user.id;
      }
      
      return this.repository.getTokenPermissions(userId);
    } catch (error: any) {
      console.error('Unexpected get token permissions error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Check if the current user can access a specific feature based on their token balance
   * This is a convenience method that combines hasPermissionViaToken with common feature access patterns
   * 
   * @param featureLevel - The level of feature to check access for ('basic', 'advanced', 'experimental')
   * @returns A promise resolving to an AuthResult containing a boolean indicating if the user has access
   */
  public async canAccessFeature(
    featureLevel: 'basic' | 'advanced' | 'experimental'
  ): Promise<AuthResult<boolean>> {
    const actionMap = {
      'basic': 'use_basic',
      'advanced': 'use_advanced',
      'experimental': 'use_experimental'
    };
    
    return this.hasPermissionViaToken('features', actionMap[featureLevel]);
  }

  /**
   * Check if the current user can access specific content based on their token balance
   * This is a convenience method that combines hasPermissionViaToken with common content access patterns
   * 
   * @param contentType - The type of content to check access for ('basic', 'premium')
   * @returns A promise resolving to an AuthResult containing a boolean indicating if the user has access
   */
  public async canAccessContent(
    contentType: 'basic' | 'premium'
  ): Promise<AuthResult<boolean>> {
    const actionMap = {
      'basic': 'view_basic',
      'premium': 'view_premium'
    };
    
    return this.hasPermissionViaToken('content', actionMap[contentType]);
  }

  /**
   * Get all active sessions for the current user
   * 
   * @returns A promise resolving to an AuthResult containing an array of user sessions
   */
  public async getUserSessions(): Promise<AuthResult<UserSession[]>> {
    try {
      const { data: user, error: userError } = await this.getUser();
      
      if (userError || !user) {
        return { 
          data: null, 
          error: userError || new AuthError('User not authenticated')
        };
      }
      
      // Get the current session to identify which one is active
      const { data: sessionData } = await this.getSession();
      const currentSessionId = sessionData?.access_token || '';
      
      const { data, error } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get user sessions error:', error);
        return { data: null, error: this.convertToAuthError(error) };
      }
      
      // Transform the data to match our interface
      const sessions: UserSession[] = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        lastActiveAt: session.last_active_at,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        isCurrent: session.id === currentSessionId
      }));
      
      return { data: sessions, error: null };
    } catch (error: any) {
      console.error('Unexpected get user sessions error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Revoke a specific session
   * 
   * @param sessionId - The ID of the session to revoke
   * @returns A promise resolving to an AuthResult containing a boolean indicating success
   */
  public async revokeSession(sessionId: string): Promise<AuthResult<boolean>> {
    try {
      const { data: user, error: userError } = await this.getUser();
      
      if (userError || !user) {
        return { 
          data: null, 
          error: userError || new AuthError('User not authenticated')
        };
      }
      
      const { error } = await this.getSupabaseClient()
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Revoke session error:', error);
        return { data: null, error: this.convertToAuthError(error) };
      }
      
      return { data: true, error: null };
    } catch (error: any) {
      console.error('Unexpected revoke session error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }

  /**
   * Revoke all sessions except the current one
   * 
   * @returns A promise resolving to an AuthResult containing a boolean indicating success
   */
  public async revokeAllOtherSessions(): Promise<AuthResult<boolean>> {
    try {
      const { data: sessions, error: sessionsError } = await this.getUserSessions();
      
      if (sessionsError || !sessions) {
        return { 
          data: null, 
          error: sessionsError || new AuthError('Failed to get user sessions')
        };
      }
      
      // Filter out the current session
      const otherSessions = sessions.filter(session => !session.isCurrent);
      
      // Revoke each session
      for (const session of otherSessions) {
        await this.revokeSession(session.id);
      }
      
      return { data: true, error: null };
    } catch (error: any) {
      console.error('Unexpected revoke all other sessions error:', error);
      return { 
        data: null, 
        error: this.convertToAuthError(error)
      };
    }
  }
}
