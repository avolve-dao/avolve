/**
 * Authentication Hook
 * 
 * This hook provides access to the authentication service and user state
 * for use in React components.
 */

'use client';

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { AuthService } from '@/lib/auth/auth-service';
import type { UserProfile, AuthResult, AuthSession } from '@/lib/auth/auth-types';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Authentication context interface
interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<AuthResult<void>>;
  signInWithMagicLink: (email: string) => Promise<AuthResult<void>>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResult<AuthSession>>;
  signOut: () => Promise<AuthResult<void>>;
  resetPassword: (email: string) => Promise<AuthResult<void>>;
  updatePassword: (newPassword: string) => Promise<AuthResult<void>>;
  updateEmail: (newEmail: string) => Promise<AuthResult<void>>;
  resendConfirmationEmail: (email: string) => Promise<AuthResult<void>>;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<AuthResult<void>>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
  isMfaRequired: () => Promise<boolean>;
  getMfaFactors: () => Promise<AuthResult<any[]>>;
  setupTotp: (friendlyName?: string) => Promise<AuthResult<any>>;
  verifyTotpFactor: (factorId: string, code: string) => Promise<AuthResult<boolean>>;
  generateRecoveryCodes: (count?: number) => Promise<AuthResult<any>>;
  verifyRecoveryCode: (code: string) => Promise<AuthResult<boolean>>;
  disableMfa: () => Promise<AuthResult<boolean>>;
  getUserSessions: () => Promise<AuthResult<any[]>>;
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
  signIn: async (email: string, password: string) => {
    const result = await AuthService.getBrowserInstance().signInWithPassword(email, password);
    return {
      data: result.error ? null : void 0,
      error: result.error || null,
    };
  },
  signInWithMagicLink: async (email: string) => {
    const result = await AuthService.getBrowserInstance().signInWithMagicLink(email);
    return {
      data: result.error ? null : void 0,
      error: result.error || null,
    };
  },
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => await AuthService.getBrowserInstance().signUp(email, password, metadata),
  signOut: async () => await AuthService.getBrowserInstance().signOut(),
  resetPassword: async (email: string) => await AuthService.getBrowserInstance().resetPassword(email),
  updatePassword: async (newPassword: string) => await AuthService.getBrowserInstance().updatePassword(newPassword),
  updateEmail: async (newEmail: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) {
      return { data: null, error: new AuthError('User not found') };
    }
    return await AuthService.getBrowserInstance().updateEmail(user.id, newEmail);
  },
  resendConfirmationEmail: async (email: string) => await AuthService.getBrowserInstance().resendConfirmationEmail(email),
  updateUserMetadata: async (metadata: Record<string, any>) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) {
      return { data: null, error: new AuthError('User not found') };
    }
    return await AuthService.getBrowserInstance().updateUserMetadata(user.id, metadata);
  },
  refreshUser: async () => {},
  hasRole: async (role: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) return false;
    const result = await AuthService.getBrowserInstance().hasRole(user.id, role);
    return Boolean(result.data);
  },
  isAdmin: async () => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) return false;
    const result = await AuthService.getBrowserInstance().isAdmin(user.id);
    return Boolean(result.data);
  },
  isMfaRequired: async () => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) return false;
    const result = await AuthService.getBrowserInstance().isMfaRequired(user.id);
    return Boolean(result.data);
  },
  getMfaFactors: async () => ({ data: null, error: null }),
  setupTotp: async (friendlyName?: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
    return await AuthService.getBrowserInstance().setupTotp(user.id, friendlyName);
  },
  verifyTotpFactor: async (factorId: string, code: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) {
      return { data: null, error: new AuthError('User not found') };
    }
    return await AuthService.getBrowserInstance().verifyTotpFactor(user.id, factorId, code);
  },
  generateRecoveryCodes: async (count?: number) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
    return await AuthService.getBrowserInstance().generateRecoveryCodes(user.id, count);
  },
  verifyRecoveryCode: async () => ({ data: null, error: null }),
  disableMfa: async () => ({ data: null, error: null }),
  getUserSessions: async () => ({ data: null, error: null }),
  revokeSession: async (sessionId: string, reason?: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
    return await AuthService.getBrowserInstance().revokeSession(user.id, sessionId, reason);
  },
  revokeAllOtherSessions: async () => ({ data: null, error: null }),
});

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
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
      const sessionResult = await authService.getSession();
      const sessionData = sessionResult?.data;
      const sessionError = sessionResult?.error;
      
      if (sessionResult && sessionError) {
        const authErr = sessionError instanceof AuthError ? sessionError : new AuthError(sessionError?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!sessionResult) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      
      setSession(sessionData?.session ?? null);
      
      // If we have a session, get the user profile
      if (sessionData?.session) {
        if (user?.id) {
          const profileResult = await authService.getUserProfile(user.id);
          const { data: profile, error: profileError } = profileResult;
          if (profileError) {
            const authErr = profileError instanceof AuthError ? profileError : new AuthError(profileError?.message || 'Unknown error');
            setError(authErr);
            setIsLoading(false);
            return { data: null, error: authErr };
          }
          if (!profile) {
            const authErr = new AuthError('Unexpected null result');
            setError(authErr);
            setIsLoading(false);
            return { data: null, error: authErr };
          }
          setUser(profile);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [authService, user]);
  
  // Initialize auth state on component mount
  useEffect(() => {
    refreshUser();
    
    // Subscribe to auth changes
    // Access the Supabase client through a public method
    const handleAuthChange = (event: string, session: AuthSession | null): void => {
      console.log('Auth state changed:', event);
      setSession(session ?? null);
      
      if (session && user?.id) {
        authService.getUserProfile(user.id).then(profileResult => {
          const { data: profile, error: profileError } = profileResult;
          if (profileError) {
            const authErr = profileError instanceof AuthError ? profileError : new AuthError(profileError?.message || 'Unknown error');
            setError(authErr);
            setIsLoading(false);
            return;
          }
          if (!profile) {
            const authErr = new AuthError('Unexpected null result');
            setError(authErr);
            setIsLoading(false);
            return;
          }
          setUser(profile);
        });
      } else {
        setUser(null);
      }
      
      // Refresh the page to ensure the session is properly loaded
      router.refresh();
    };
    
    const { data } = authService.getSupabaseClient().auth.onAuthStateChange(handleAuthChange);
    
    // Cleanup subscription on unmount
    return () => {
      data.subscription.unsubscribe();
    };
  }, [authService, refreshUser, router, user]);
  
  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signInWithPassword(email, password);
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      await refreshUser();
      return {
        data: result.error ? null : void 0,
        error: result.error || null,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService, refreshUser]);
  
  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signInWithMagicLink(email);
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      return {
        data: result.error ? null : void 0,
        error: result.error || null,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService]);
  
  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(email, password, metadata);
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      await refreshUser();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService, refreshUser]);
  
  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signOut();
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      setUser(null);
      setSession(null);
      router.push('/');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService, router]);
  
  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.resetPassword(email);
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService]);
  
  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.updatePassword(newPassword);
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      await refreshUser();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService, refreshUser]);
  
  // Update email
  const updateEmail = useCallback(async (newEmail: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) {
      return { data: null, error: new AuthError('User not found') };
    }
    return await AuthService.getBrowserInstance().updateEmail(user.id, newEmail);
  }, []);
  
  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.resendConfirmationEmail(email);
      if (result && result.error) {
        const authErr = result.error instanceof AuthError ? result.error : new AuthError(result.error?.message || 'Unknown error');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      if (!result) {
        const authErr = new AuthError('Unexpected null result');
        setError(authErr);
        setIsLoading(false);
        return { data: null, error: authErr };
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(new AuthError(errorMsg));
      setIsLoading(false);
      return { data: null, error: new AuthError(errorMsg) };
    }
  }, [authService]);
  
  // Update user metadata
  const updateUserMetadata = useCallback(async (metadata: Record<string, any>) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user || !user.id) {
      return { data: null, error: new AuthError('User not found') };
    }
    return await AuthService.getBrowserInstance().updateUserMetadata(user.id, metadata);
  }, []);
  
  // Check if user has specific role
  const hasRole = useCallback(
    async (role: string) => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return false;
      const result = await AuthService.getBrowserInstance().hasRole(user.id, role);
      return Boolean(result.data);
    },
    []
  );
  
  // Check if user is admin
  const isAdmin = useCallback(
    async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return false;
      const result = await AuthService.getBrowserInstance().isAdmin(user.id);
      return Boolean(result.data);
    },
    []
  );
  
  // Check if MFA is required
  const isMfaRequired = useCallback(
    async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return false;
      const result = await AuthService.getBrowserInstance().isMfaRequired(user.id);
      return Boolean(result.data);
    },
    []
  );
  
  // Get MFA factors
  const getMfaFactors = useCallback(
    async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().getMfaFactors(user.id);
    },
    []
  );
  
  // Setup TOTP
  const setupTotp = useCallback(
    async (friendlyName?: string) => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().setupTotp(user.id, friendlyName);
    },
    []
  );
  
  // Verify TOTP factor
  const verifyTotpFactor = useCallback(
    async (factorId: string, code: string) => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) {
        return { data: null, error: new AuthError('User not found') };
      }
      return await AuthService.getBrowserInstance().verifyTotpFactor(user.id, factorId, code);
    },
    []
  );
  
  // Generate recovery codes
  const generateRecoveryCodes = useCallback(
    async (count?: number) => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().generateRecoveryCodes(user.id, count);
    },
    []
  );
  
  // Verify recovery code
  const verifyRecoveryCode = useCallback(
    async (code: string) => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().verifyRecoveryCode(user.id, code);
    },
    []
  );
  
  // Disable MFA
  const disableMfa = useCallback(
    async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().disableMfa(user.id);
    },
    []
  );
  
  // Get user sessions
  const getUserSessions = useCallback(
    async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().getUserSessions(user.id);
    },
    []
  );
  
  // Revoke session
  const revokeSession = useCallback(
    async (sessionId: string, reason?: string) => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().revokeSession(user.id, sessionId, reason);
    },
    []
  );
  
  // Revoke all other sessions
  const revokeAllOtherSessions = useCallback(
    async () => {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
      if (!user || !user.id) return { data: null, error: new AuthError('User not found') };
      return await AuthService.getBrowserInstance().revokeAllOtherSessions(user.id);
    },
    []
  );
  
  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    error,
    signIn: async (email: string, password: string) => {
      const result = await signIn(email, password);
      return {
        data: result.error ? null : void 0,
        error: result.error || null,
      };
    },
    signInWithMagicLink: async (email: string) => {
      const result = await signInWithMagicLink(email);
      return {
        data: result.error ? null : void 0,
        error: result.error || null,
      };
    },
    signUp: async (email: string, password: string, metadata?: Record<string, any>) => await signUp(email, password, metadata),
    signOut: async () => await signOut(),
    resetPassword: async (email: string) => await resetPassword(email),
    updatePassword: async (newPassword: string) => await updatePassword(newPassword),
    updateEmail: async (newEmail: string) => await updateEmail(newEmail),
    resendConfirmationEmail: async (email: string) => await resendConfirmationEmail(email),
    updateUserMetadata: async (metadata: Record<string, any>) => await updateUserMetadata(metadata),
    refreshUser: async () => { await refreshUser(); },
    hasRole: async (role: string) => Boolean(await hasRole(role)),
    isAdmin: async () => Boolean(await isAdmin()),
    isMfaRequired: async () => Boolean(await isMfaRequired()),
    getMfaFactors: async () => await getMfaFactors(),
    setupTotp: async (friendlyName?: string) => await setupTotp(friendlyName),
    verifyTotpFactor: async (factorId: string, code: string) => await verifyTotpFactor(factorId, code),
    generateRecoveryCodes: async (count?: number) => await generateRecoveryCodes(count),
    verifyRecoveryCode: async (code: string) => await verifyRecoveryCode(code),
    disableMfa: async () => await disableMfa(),
    getUserSessions: async () => await getUserSessions(),
    revokeSession: async (sessionId: string, reason?: string) => await revokeSession(sessionId, reason),
    revokeAllOtherSessions: async () => await revokeAllOtherSessions(),
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
