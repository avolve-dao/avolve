/**
 * Authentication Service
 * 
 * This service centralizes all authentication-related functionality for the Avolve platform.
 * It provides methods for user authentication, session management, and security features.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { 
  AuthError, 
  AuthResponse, 
  Session, 
  User, 
  UserResponse,
  SupabaseClient
} from '@supabase/supabase-js';

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

// Authentication result interface
export interface AuthResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User settings interface
export interface UserSettings {
  id: string;
  theme: string;
  notificationPreferences: Record<string, any>;
  privacySettings: Record<string, any>;
  language: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

// MFA Factor types
export type MfaFactorType = 'totp' | 'sms' | 'recovery';

// MFA Factor interface
export interface MfaFactor {
  id: string;
  userId: string;
  factorType: MfaFactorType;
  factorId: string;
  friendlyName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

// TOTP Factor interface
export interface TotpFactor extends MfaFactor {
  factorType: 'totp';
  secret: string;
  qrCode: string;
}

// Recovery Codes interface
export interface RecoveryCodes {
  codes: string[];
  userId: string;
}

// User Session interface
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

// Role interface
export interface Role {
  id: string;
  userId: string;
  role: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Permission interface
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

// User Permission interface
export interface UserPermission {
  id: string;
  userId: string;
  resource: string;
  action: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication Service Class
 */
export class AuthService {
  private client: SupabaseClient;
  private static instance: AuthService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get browser-side instance of the auth service
   */
  public static getBrowserInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(createBrowserClient());
    }
    return AuthService.instance;
  }

  /**
   * Get server-side instance of the auth service
   */
  public static getServerInstance(): AuthService {
    // Server-side instance is always created fresh to ensure correct cookie handling
    return new AuthService(createServerClient());
  }

  /**
   * Get the Supabase client
   * This is needed for direct access to the client in certain scenarios
   */
  public getSupabaseClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Sign in with email and password
   */
  public async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthResult<Session>> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { data: null, error: convertError(error) };
      }

      return { data: data.session, error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred during sign in') 
      };
    }
  }

  /**
   * Sign in with magic link (passwordless)
   */
  public async signInWithMagicLink(
    email: string,
    redirectTo?: string
  ): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('Magic link sign in error:', error);
        return { data: null, error: convertError(error) };
      }

      return { 
        data: null, 
        error: null, 
        message: 'Magic link sent to your email' 
      };
    } catch (error) {
      console.error('Unexpected magic link sign in error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred during magic link sign in') 
      };
    }
  }

  /**
   * Sign up with email and password
   */
  public async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>,
    redirectTo?: string
  ): Promise<AuthResult<User>> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { data: null, error: convertError(error) };
      }

      return { data: data.user, error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred during sign up') 
      };
    }
  }

  /**
   * Sign out the current user
   */
  public async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { data: null, error: convertError(error) };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred during sign out') 
      };
    }
  }

  /**
   * Get the current session
   */
  public async getSession(): Promise<AuthResult<Session>> {
    try {
      const { data, error } = await this.client.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
        return { data: null, error: convertError(error) };
      }

      return { data: data.session, error: null };
    } catch (error) {
      console.error('Unexpected get session error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting session') 
      };
    }
  }

  /**
   * Get the current user
   */
  public async getUser(): Promise<AuthResult<User>> {
    try {
      const { data, error } = await this.client.auth.getUser();

      if (error) {
        console.error('Get user error:', error);
        return { data: null, error: convertError(error) };
      }

      return { data: data.user, error: null };
    } catch (error) {
      console.error('Unexpected get user error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user') 
      };
    }
  }

  /**
   * Get the user profile
   */
  public async getUserProfile(userId?: string): Promise<AuthResult<UserProfile>> {
    try {
      // If userId is not provided, get the current user
      if (!userId) {
        const { data: user } = await this.getUser();
        
        if (!user) {
          return { 
            data: null, 
            error: new AuthError('User not authenticated') 
          };
        }
        
        userId = user.id;
      }
      
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Get user profile error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as UserProfile, error: null };
    } catch (error) {
      console.error('Unexpected get user profile error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user profile') 
      };
    }
  }

  /**
   * Update the user profile
   */
  public async updateUserProfile(
    profile: Partial<UserProfile>
  ): Promise<AuthResult<UserProfile>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: null, 
          error: new AuthError('User not authenticated') 
        };
      }
      
      const { data, error } = await this.client
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update user profile error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as UserProfile, error: null };
    } catch (error) {
      console.error('Unexpected update user profile error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while updating user profile') 
      };
    }
  }

  /**
   * Get the user settings
   */
  public async getUserSettings(userId?: string): Promise<AuthResult<UserSettings>> {
    try {
      // If userId is not provided, get the current user
      if (!userId) {
        const { data: user } = await this.getUser();
        
        if (!user) {
          return { 
            data: null, 
            error: new AuthError('User not authenticated') 
          };
        }
        
        userId = user.id;
      }
      
      const { data, error } = await this.client
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Get user settings error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as UserSettings, error: null };
    } catch (error) {
      console.error('Unexpected get user settings error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user settings') 
      };
    }
  }

  /**
   * Update the user settings
   */
  public async updateUserSettings(
    settings: Partial<UserSettings>
  ): Promise<AuthResult<UserSettings>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: null, 
          error: new AuthError('User not authenticated') 
        };
      }
      
      const { data, error } = await this.client
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update user settings error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as UserSettings, error: null };
    } catch (error) {
      console.error('Unexpected update user settings error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while updating user settings') 
      };
    }
  }

  /**
   * Update the user's email
   */
  public async updateEmail(
    email: string,
    redirectTo?: string
  ): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.updateUser({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });
      
      if (error) {
        console.error('Update email error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { 
        data: null, 
        error: null, 
        message: 'Email update confirmation sent to your new email' 
      };
    } catch (error) {
      console.error('Unexpected update email error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while updating email') 
      };
    }
  }

  /**
   * Update the user's password
   */
  public async updatePassword(
    password: string
  ): Promise<AuthResult<User>> {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password
      });
      
      if (error) {
        console.error('Update password error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data.user, error: null };
    } catch (error) {
      console.error('Unexpected update password error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while updating password') 
      };
    }
  }

  /**
   * Reset the user's password (forgot password flow)
   */
  public async resetPassword(
    email: string,
    redirectTo?: string
  ): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(
        email,
        {
          redirectTo
        }
      );
      
      if (error) {
        console.error('Reset password error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { 
        data: null, 
        error: null, 
        message: 'Password reset instructions sent to your email' 
      };
    } catch (error) {
      console.error('Unexpected reset password error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while resetting password') 
      };
    }
  }

  /**
   * Get the user's roles
   */
  public async getUserRoles(userId?: string): Promise<AuthResult<Role[]>> {
    try {
      // If userId is not provided, get the current user
      if (!userId) {
        const { data: user } = await this.getUser();
        
        if (!user) {
          return { 
            data: null, 
            error: new AuthError('User not authenticated') 
          };
        }
        
        userId = user.id;
      }
      
      const { data, error } = await this.client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .is('expires_at', null)
        .or(`expires_at.gt.${new Date().toISOString()}`);
      
      if (error) {
        console.error('Get user roles error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as Role[], error: null };
    } catch (error) {
      console.error('Unexpected get user roles error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user roles') 
      };
    }
  }

  /**
   * Check if the user has a specific role
   */
  public async hasRole(role: string): Promise<AuthResult<boolean>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: false, 
          error: null 
        };
      }
      
      const { data, error } = await this.client.rpc('has_role', {
        p_role: role
      });
      
      if (error) {
        console.error('Has role error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected has role error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking role') 
      };
    }
  }

  /**
   * Get the user's permissions
   */
  public async getUserPermissions(userId?: string): Promise<AuthResult<Permission[]>> {
    try {
      // If userId is not provided, get the current user
      if (!userId) {
        const { data: user } = await this.getUser();
        
        if (!user) {
          return { 
            data: null, 
            error: new AuthError('User not authenticated') 
          };
        }
        
        userId = user.id;
      }
      
      const { data, error } = await this.client.rpc('get_user_permissions', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Get user permissions error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: data as Permission[], error: null };
    } catch (error) {
      console.error('Unexpected get user permissions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user permissions') 
      };
    }
  }

  /**
   * Check if the user has a specific permission
   */
  public async hasPermission(resource: string, action: string): Promise<AuthResult<boolean>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: false, 
          error: null 
        };
      }
      
      const { data, error } = await this.client.rpc('has_permission', {
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Has permission error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected has permission error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking permission') 
      };
    }
  }

  /**
   * Check if the user has permission via token
   */
  public async hasPermissionViaToken(resource: string, action: string): Promise<AuthResult<boolean>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: false, 
          error: null 
        };
      }
      
      const { data, error } = await this.client.rpc('has_permission_via_token', {
        p_user_id: user.id,
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Has permission via token error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected has permission via token error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while checking permission via token') 
      };
    }
  }

  /**
   * Get all active sessions for the current user
   */
  public async getUserSessions(): Promise<AuthResult<UserSession[]>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: null, 
          error: new AuthError('User not authenticated') 
        };
      }
      
      // Get the current session to identify which one is active
      const { data: sessionData } = await this.getSession();
      const currentSessionId = sessionData?.access_token || '';
      
      const { data, error } = await this.client
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get user sessions error:', error);
        return { data: null, error: convertError(error) };
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
    } catch (error) {
      console.error('Unexpected get user sessions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user sessions') 
      };
    }
  }

  /**
   * Revoke a specific session
   */
  public async revokeSession(sessionId: string): Promise<AuthResult<boolean>> {
    try {
      const { data: user } = await this.getUser();
      
      if (!user) {
        return { 
          data: null, 
          error: new AuthError('User not authenticated') 
        };
      }
      
      const { error } = await this.client
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Revoke session error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected revoke session error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while revoking session') 
      };
    }
  }

  /**
   * Revoke all sessions except the current one
   */
  public async revokeAllOtherSessions(): Promise<AuthResult<boolean>> {
    try {
      const { data: sessions } = await this.getUserSessions();
      
      if (!sessions) {
        return { 
          data: null, 
          error: new AuthError('Failed to get user sessions') 
        };
      }
      
      // Filter out the current session
      const otherSessions = sessions.filter(session => !session.isCurrent);
      
      // Revoke each session
      for (const session of otherSessions) {
        await this.revokeSession(session.id);
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected revoke all other sessions error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while revoking all other sessions') 
      };
    }
  }
}
