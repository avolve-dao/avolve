/**
 * Auth Hook
 * 
 * This hook provides authentication functionality for React components.
 * It wraps the AuthService to provide a more React-friendly interface.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService, UserProfile, UserSettings, Role, Permission } from './auth-service';

export interface AuthContextState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  roles: Role[];
  permissions: Permission[];
  error: Error | null;
}

export function useAuth() {
  const authService = useMemo(() => AuthService.getBrowserInstance(), []);
  
  const [state, setState] = useState<AuthContextState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    session: null,
    profile: null,
    settings: null,
    roles: [],
    permissions: [],
    error: null
  });

  // Load initial auth state
  const loadAuthState = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get session and user
      const { data: session } = await authService.getSession();
      const { data: user } = await authService.getUser();
      
      if (!session || !user) {
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          session: null,
          profile: null,
          settings: null,
          roles: [],
          permissions: [],
          error: null
        });
        return;
      }
      
      // Get user profile and settings
      const { data: profile } = await authService.getUserProfile();
      const { data: settings } = await authService.getUserSettings();
      
      // Get roles and permissions
      const { data: roles = [] } = await authService.getUserRoles();
      const { data: permissions = [] } = await authService.getUserPermissions();
      
      setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        session,
        profile,
        settings,
        roles,
        permissions,
        error: null
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to load auth state')
      }));
    }
  }, [authService]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = authService.getSupabaseClient().auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadAuthState();
        } else if (event === 'SIGNED_OUT') {
          setState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            session: null,
            profile: null,
            settings: null,
            roles: [],
            permissions: [],
            error: null
          });
        }
      }
    );

    // Load initial state
    loadAuthState();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [authService, loadAuthState]);

  // Sign in with email and password
  const signInWithPassword = useCallback(async (
    email: string,
    password: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.signInWithPassword(email, password);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      await loadAuthState();
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign in')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to sign in')
      };
    }
  }, [authService, loadAuthState]);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (
    email: string,
    redirectTo?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.signInWithMagicLink(email, redirectTo);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Magic link sign in error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to send magic link')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to send magic link')
      };
    }
  }, [authService]);

  // Sign up with email and password
  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata?: Record<string, any>,
    redirectTo?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.signUp(email, password, metadata, redirectTo);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign up')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to sign up')
      };
    }
  }, [authService]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.signOut();
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        session: null,
        profile: null,
        settings: null,
        roles: [],
        permissions: [],
        error: null
      });
      
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign out')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to sign out')
      };
    }
  }, [authService]);

  // Update user profile
  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.updateUserProfile(profile);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        profile: result.data
      }));
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to update profile')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update profile')
      };
    }
  }, [authService]);

  // Update user settings
  const updateSettings = useCallback(async (settings: Partial<UserSettings>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.updateUserSettings(settings);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        settings: result.data
      }));
      
      return result;
    } catch (error) {
      console.error('Update settings error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to update settings')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update settings')
      };
    }
  }, [authService]);

  // Update email
  const updateEmail = useCallback(async (
    email: string,
    redirectTo?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.updateEmail(email, redirectTo);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Update email error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to update email')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update email')
      };
    }
  }, [authService]);

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.updatePassword(password);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Update password error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to update password')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update password')
      };
    }
  }, [authService]);

  // Reset password
  const resetPassword = useCallback(async (
    email: string,
    redirectTo?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await authService.resetPassword(email, redirectTo);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to reset password')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to reset password')
      };
    }
  }, [authService]);

  // Check if user has a specific role
  const hasRole = useCallback(async (role: string) => {
    try {
      const result = await authService.hasRole(role);
      return result.data || false;
    } catch (error) {
      console.error('Check role error:', error);
      return false;
    }
  }, [authService]);

  // Check if user has a specific permission
  const hasPermission = useCallback(async (resource: string, action: string) => {
    try {
      const result = await authService.hasPermission(resource, action);
      return result.data || false;
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }, [authService]);

  // Check if user has a specific permission via token
  const hasPermissionViaToken = useCallback(async (resource: string, action: string) => {
    try {
      const result = await authService.hasPermissionViaToken(resource, action);
      return result.data || false;
    } catch (error) {
      console.error('Check permission via token error:', error);
      return false;
    }
  }, [authService]);

  // Get user sessions
  const getUserSessions = useCallback(async () => {
    try {
      return await authService.getUserSessions();
    } catch (error) {
      console.error('Get user sessions error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to get user sessions')
      };
    }
  }, [authService]);

  // Revoke a session
  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      return await authService.revokeSession(sessionId);
    } catch (error) {
      console.error('Revoke session error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to revoke session')
      };
    }
  }, [authService]);

  // Revoke all other sessions
  const revokeAllOtherSessions = useCallback(async () => {
    try {
      return await authService.revokeAllOtherSessions();
    } catch (error) {
      console.error('Revoke all other sessions error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to revoke all other sessions')
      };
    }
  }, [authService]);

  return {
    // State
    ...state,
    
    // Auth methods
    signInWithPassword,
    signInWithMagicLink,
    signUp,
    signOut,
    updateProfile,
    updateSettings,
    updateEmail,
    updatePassword,
    resetPassword,
    
    // Role and permission methods
    hasRole,
    hasPermission,
    hasPermissionViaToken,
    
    // Session management
    getUserSessions,
    revokeSession,
    revokeAllOtherSessions,
    
    // Auth service (for direct access if needed)
    authService
  };
}
