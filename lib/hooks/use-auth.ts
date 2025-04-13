/**
 * Authentication Hook
 * 
 * This hook provides access to the authentication service and user state
 * for use in React components.
 */

'use client';

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { AuthService, UserProfile, AuthResult, MfaFactor, TotpFactor, RecoveryCodes, UserSession } from '@/lib/auth/auth-service';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Authentication context interface
interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<AuthResult<Session>>;
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<AuthResult<void>>;
  signUp: (email: string, password: string, metadata?: Record<string, any>, redirectTo?: string) => Promise<AuthResult<User>>;
  signOut: () => Promise<AuthResult<void>>;
  resetPassword: (email: string, redirectTo?: string) => Promise<AuthResult<void>>;
  updatePassword: (newPassword: string) => Promise<AuthResult<User>>;
  updateEmail: (newEmail: string) => Promise<AuthResult<User>>;
  resendConfirmationEmail: (email: string, redirectTo?: string) => Promise<AuthResult<void>>;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<AuthResult<User>>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
  isMfaRequired: () => Promise<boolean>;
  getMfaFactors: () => Promise<AuthResult<MfaFactor[]>>;
  setupTotp: (friendlyName?: string) => Promise<AuthResult<TotpFactor>>;
  verifyTotpFactor: (factorId: string, code: string) => Promise<AuthResult<boolean>>;
  generateRecoveryCodes: (count?: number) => Promise<AuthResult<RecoveryCodes>>;
  verifyRecoveryCode: (code: string) => Promise<AuthResult<boolean>>;
  disableMfa: () => Promise<AuthResult<boolean>>;
  getUserSessions: () => Promise<AuthResult<UserSession[]>>;
  revokeSession: (sessionId: string, reason?: string) => Promise<AuthResult<boolean>>;
  revokeAllOtherSessions: () => Promise<AuthResult<boolean>>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  signIn: async () => ({ data: null, error: null }),
  signInWithMagicLink: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => ({ data: null, error: null }),
  resetPassword: async () => ({ data: null, error: null }),
  updatePassword: async () => ({ data: null, error: null }),
  updateEmail: async () => ({ data: null, error: null }),
  resendConfirmationEmail: async () => ({ data: null, error: null }),
  updateUserMetadata: async () => ({ data: null, error: null }),
  refreshUser: async () => {},
  hasRole: async () => false,
  isAdmin: async () => false,
  isMfaRequired: async () => false,
  getMfaFactors: async () => ({ data: null, error: null }),
  setupTotp: async () => ({ data: null, error: null }),
  verifyTotpFactor: async () => ({ data: null, error: null }),
  generateRecoveryCodes: async () => ({ data: null, error: null }),
  verifyRecoveryCode: async () => ({ data: null, error: null }),
  disableMfa: async () => ({ data: null, error: null }),
  getUserSessions: async () => ({ data: null, error: null }),
  revokeSession: async () => ({ data: null, error: null }),
  revokeAllOtherSessions: async () => ({ data: null, error: null }),
});

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  
  // Get auth service instance
  const authService = AuthService.getBrowserInstance();
  
  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get session first
      const { data: sessionData, error: sessionError } = await authService.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      setSession(sessionData);
      
      // If we have a session, get the user profile
      if (sessionData) {
        const { data: profileData, error: profileError } = await authService.getUserProfile();
        
        if (profileError) {
          throw profileError;
        }
        
        setUser(profileData);
      } else {
        setUser(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err instanceof AuthError ? err : new AuthError('Failed to refresh user'));
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Initialize auth state on component mount
  useEffect(() => {
    refreshUser();
    
    // Subscribe to auth changes
    // Access the Supabase client through a public method
    const { data } = authService.getSupabaseClient().auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event);
        setSession(session);
        
        if (session) {
          const { data: profileData } = await authService.getUserProfile();
          setUser(profileData);
        } else {
          setUser(null);
        }
        
        // Refresh the page to ensure the session is properly loaded
        router.refresh();
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      data.subscription.unsubscribe();
    };
  }, [authService, refreshUser, router]);
  
  // Sign in with email and password
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult<Session>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.signInWithPassword(email, password);
        
        if (result.error) {
          setError(result.error);
        } else {
          await refreshUser();
        }
        
        return result;
      } catch (err) {
        console.error('Error during sign in:', err);
        const authError = new AuthError('An unexpected error occurred during sign in');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService, refreshUser]
  );
  
  // Sign in with magic link
  const signInWithMagicLink = useCallback(
    async (email: string, redirectTo?: string): Promise<AuthResult<void>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.signInWithMagicLink(email, redirectTo);
        
        if (result.error) {
          setError(result.error);
        }
        
        return result;
      } catch (err) {
        console.error('Error sending magic link:', err);
        const authError = new AuthError('An unexpected error occurred while sending magic link');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );
  
  // Sign up with email and password
  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, any>, redirectTo?: string): Promise<AuthResult<User>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.signUp(email, password, metadata, redirectTo);
        
        if (result.error) {
          setError(result.error);
        }
        
        return result;
      } catch (err) {
        console.error('Error during sign up:', err);
        const authError = new AuthError('An unexpected error occurred during sign up');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );
  
  // Sign out
  const signOut = useCallback(async (): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.signOut();
      
      if (result.error) {
        setError(result.error);
      } else {
        setUser(null);
        setSession(null);
        router.push('/');
      }
      
      return result;
    } catch (err) {
      console.error('Error during sign out:', err);
      const authError = new AuthError('An unexpected error occurred during sign out');
      setError(authError);
      return { data: null, error: authError };
    } finally {
      setIsLoading(false);
    }
  }, [authService, router]);
  
  // Reset password
  const resetPassword = useCallback(
    async (email: string, redirectTo?: string): Promise<AuthResult<void>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.resetPassword(email, redirectTo);
        
        if (result.error) {
          setError(result.error);
        }
        
        return result;
      } catch (err) {
        console.error('Error resetting password:', err);
        const authError = new AuthError('An unexpected error occurred during password reset');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );
  
  // Update password
  const updatePassword = useCallback(
    async (newPassword: string): Promise<AuthResult<User>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.updatePassword(newPassword);
        
        if (result.error) {
          setError(result.error);
        } else {
          await refreshUser();
        }
        
        return result;
      } catch (err) {
        console.error('Error updating password:', err);
        const authError = new AuthError('An unexpected error occurred while updating password');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService, refreshUser]
  );
  
  // Update email
  const updateEmail = useCallback(
    async (newEmail: string): Promise<AuthResult<User>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.updateEmail(newEmail);
        
        if (result.error) {
          setError(result.error);
        } else {
          await refreshUser();
        }
        
        return result;
      } catch (err) {
        console.error('Error updating email:', err);
        const authError = new AuthError('An unexpected error occurred while updating email');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService, refreshUser]
  );
  
  // Resend confirmation email
  const resendConfirmationEmail = useCallback(
    async (email: string, redirectTo?: string): Promise<AuthResult<void>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.resendConfirmationEmail(email, redirectTo);
        
        if (result.error) {
          setError(result.error);
        }
        
        return result;
      } catch (err) {
        console.error('Error resending confirmation email:', err);
        const authError = new AuthError('An unexpected error occurred while resending confirmation');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );
  
  // Update user metadata
  const updateUserMetadata = useCallback(
    async (metadata: Record<string, any>): Promise<AuthResult<User>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await authService.updateUserMetadata(metadata);
        
        if (result.error) {
          setError(result.error);
        } else {
          await refreshUser();
        }
        
        return result;
      } catch (err) {
        console.error('Error updating user metadata:', err);
        const authError = new AuthError('An unexpected error occurred while updating user metadata');
        setError(authError);
        return { data: null, error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [authService, refreshUser]
  );
  
  // Check if user has specific role
  const hasRole = useCallback(
    async (role: string) => {
      try {
        return await authService.hasRole(role);
      } catch (err) {
        console.error('Error checking role:', err);
        return false;
      }
    },
    [authService]
  );
  
  // Check if user is admin
  const isAdmin = useCallback(
    async () => {
      try {
        return await authService.isAdmin();
      } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
      }
    },
    [authService]
  );
  
  // Check if MFA is required
  const isMfaRequired = useCallback(
    async () => {
      try {
        return await authService.isMfaRequired();
      } catch (err) {
        console.error('Error checking MFA requirement:', err);
        return false;
      }
    },
    [authService]
  );
  
  // Get MFA factors
  const getMfaFactors = useCallback(
    async () => {
      try {
        return await authService.getMfaFactors();
      } catch (err) {
        console.error('Error getting MFA factors:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Setup TOTP
  const setupTotp = useCallback(
    async (friendlyName?: string) => {
      try {
        return await authService.setupTotp(friendlyName);
      } catch (err) {
        console.error('Error setting up TOTP:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Verify TOTP factor
  const verifyTotpFactor = useCallback(
    async (factorId: string, code: string) => {
      try {
        return await authService.verifyTotpFactor(factorId, code);
      } catch (err) {
        console.error('Error verifying TOTP factor:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Generate recovery codes
  const generateRecoveryCodes = useCallback(
    async (count?: number) => {
      try {
        return await authService.generateRecoveryCodes(count);
      } catch (err) {
        console.error('Error generating recovery codes:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Verify recovery code
  const verifyRecoveryCode = useCallback(
    async (code: string) => {
      try {
        return await authService.verifyRecoveryCode(code);
      } catch (err) {
        console.error('Error verifying recovery code:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Disable MFA
  const disableMfa = useCallback(
    async () => {
      try {
        return await authService.disableMfa();
      } catch (err) {
        console.error('Error disabling MFA:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Get user sessions
  const getUserSessions = useCallback(
    async () => {
      try {
        return await authService.getUserSessions();
      } catch (err) {
        console.error('Error getting user sessions:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Revoke session
  const revokeSession = useCallback(
    async (sessionId: string, reason?: string) => {
      try {
        return await authService.revokeSession(sessionId, reason);
      } catch (err) {
        console.error('Error revoking session:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  // Revoke all other sessions
  const revokeAllOtherSessions = useCallback(
    async () => {
      try {
        return await authService.revokeAllOtherSessions();
      } catch (err) {
        console.error('Error revoking all other sessions:', err);
        return { 
          data: null, 
          error: new AuthError(err instanceof Error ? err.message : 'Unknown error') 
        };
      }
    },
    [authService]
  );
  
  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    error,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    resendConfirmationEmail,
    updateUserMetadata,
    refreshUser,
    hasRole,
    isAdmin,
    isMfaRequired,
    getMfaFactors,
    setupTotp,
    verifyTotpFactor,
    generateRecoveryCodes,
    verifyRecoveryCode,
    disableMfa,
    getUserSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

/**
 * Hook to use authentication in components
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * HOC to protect routes that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string; requiredRole?: string } = {}
) {
  return function WithAuth(props: P) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean>(false);
    
    useEffect(() => {
      const checkAuth = async () => {
        // Wait for auth to load
        if (isLoading) return;
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          if (options.redirectTo) {
            router.push(options.redirectTo);
          }
          return;
        }
        
        // Check for required role if specified
        if (options.requiredRole && !(await hasRole(options.requiredRole))) {
          router.push('/unauthorized');
          return;
        }
        
        // User is authorized
        setAuthorized(true);
      };
      
      checkAuth();
    }, [isAuthenticated, isLoading, hasRole, router]);
    
    // Show loading state while checking auth
    if (isLoading || !authorized) {
      return React.createElement(
        'div',
        null,
        React.createElement('span', null, 'Loading...')
      );
    }
    
    // Render the protected component
    return React.createElement(Component, props);
  };
}

export default useAuth;
