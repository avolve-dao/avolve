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

import { 
  AuthError, 
  SupabaseClient, 
  User 
} from '@supabase/supabase-js';
import { 
  AuthResult, 
  AuthSession, 
  UserProfile 
} from './auth-types';

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
   * Helper method to convert any error to AuthError
   * 
   * @param error - The error to convert
   * @returns An AuthError instance
   */
  private convertError(error: any): AuthError {
    if (error instanceof AuthError) {
      return error;
    }
    
    // Handle PostgrestError (from Supabase Database)
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return new AuthError(error.message);
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
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
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
          data: metadata
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
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
        console.error('Sign out error:', error);
        return { data: null, error };
      }

      return { data: null, error: null };
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Get the current user
   * 
   * @returns A promise resolving to an AuthResult containing the current user
   */
  public async getCurrentUser(): Promise<AuthResult<User | null>> {
    try {
      const { data, error } = await this.client.auth.getUser();

      if (error) {
        console.error('Get user error:', error);
        return { data: null, error };
      }

      return { data: data.user, error: null };
    } catch (error: any) {
      console.error('Unexpected get user error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Get the current session
   * 
   * @returns A promise resolving to an AuthResult containing the current session
   */
  public async getSession(): Promise<AuthResult<AuthSession | null>> {
    try {
      const { data, error } = await this.client.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error: any) {
      console.error('Unexpected get session error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
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
      const { error } = await this.client.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('Reset password error:', error);
        return { data: null, error };
      }
      
      return { 
        data: null, 
        error: null, 
        message: 'Password reset instructions sent to your email' 
      };
    } catch (error: any) {
      console.error('Unexpected reset password error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Update password
   * 
   * @param password - The new password
   * @returns A promise resolving to an AuthResult containing the updated user
   */
  public async updatePassword(password: string): Promise<AuthResult<User>> {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password
      });
      
      if (error) {
        console.error('Update password error:', error);
        return { data: null, error };
      }
      
      return { data: data.user, error: null };
    } catch (error: any) {
      console.error('Unexpected update password error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Get the user's profile
   * 
   * @param userId - The user's ID
   * @returns A promise resolving to an AuthResult containing the user's profile
   */
  public async getUserProfile(userId: string): Promise<AuthResult<UserProfile>> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Get user profile error:', error);
        return { data: null, error: this.convertError(error) };
      }
      
      // Transform the database profile to match our UserProfile interface
      const profile: UserProfile = {
        id: data.id,
        email: '', // Email is not stored in profiles table, we'll need to get it from auth.users
        displayName: data.username || '',
        fullName: data.full_name || '',
        avatarUrl: data.avatar_url || '',
        bio: data.bio || '',
        location: '', // Not in profiles table
        website: data.website || '',
        emailVerified: false, // Not in profiles table
        lastSeenAt: data.last_active_at || '',
        createdAt: '', // Not in profiles table
        updatedAt: data.updated_at || ''
      };
      
      return { data: profile, error: null };
    } catch (error: any) {
      console.error('Unexpected get user profile error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Update the user's profile
   * 
   * @param userId - The user's ID
   * @param profile - The updated profile data
   * @returns A promise resolving to an AuthResult containing the updated profile
   */
  public async updateUserProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<AuthResult<UserProfile>> {
    try {
      // Transform our UserProfile interface to match the profiles table
      const dbProfile: any = {
        username: profile.displayName,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        bio: profile.bio,
        website: profile.website,
        last_active_at: profile.lastSeenAt ? new Date(profile.lastSeenAt).toISOString() : undefined,
        updated_at: new Date().toISOString()
      };
      
      // Remove undefined values
      Object.keys(dbProfile).forEach(key => {
        if (dbProfile[key] === undefined) {
          delete dbProfile[key];
        }
      });
      
      const { data, error } = await this.client
        .from('profiles')
        .update(dbProfile)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Update user profile error:', error);
        return { data: null, error: this.convertError(error) };
      }
      
      // Transform the database profile back to our UserProfile interface
      const updatedProfile: UserProfile = {
        id: data.id,
        email: '', // Email is not stored in profiles table
        displayName: data.username || '',
        fullName: data.full_name || '',
        avatarUrl: data.avatar_url || '',
        bio: data.bio || '',
        location: '', // Not in profiles table
        website: data.website || '',
        emailVerified: false, // Not in profiles table
        lastSeenAt: data.last_active_at || '',
        createdAt: '', // Not in profiles table
        updatedAt: data.updated_at || ''
      };
      
      return { data: updatedProfile, error: null };
    } catch (error: any) {
      console.error('Unexpected update user profile error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Check if a user has permission via token
   * 
   * @param userId - The user's ID
   * @param resource - The resource to check permission for
   * @param action - The action to check permission for
   * @returns A promise resolving to an AuthResult containing a boolean indicating if the user has permission
   */
  public async hasPermissionViaToken(
    userId: string,
    resource: string,
    action: string
  ): Promise<AuthResult<boolean>> {
    try {
      const { data, error } = await this.client.rpc('has_permission_via_token', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action
      });
      
      if (error) {
        console.error('Has permission via token error:', error);
        return { data: null, error: this.convertError(error) };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected has permission via token error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }

  /**
   * Get all permissions for a user based on their token balance
   * 
   * @param userId - The user's ID
   * @returns A promise resolving to an AuthResult containing an array of permissions with their status
   */
  public async getTokenPermissions(
    userId: string
  ): Promise<AuthResult<{ resource: string; action: string; hasPermission: boolean }[]>> {
    try {
      const { data, error } = await this.client.rpc('get_token_permissions', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Get token permissions error:', error);
        return { data: null, error: this.convertError(error) };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected get token permissions error:', error);
      return { 
        data: null, 
        error: this.convertError(error)
      };
    }
  }
}
