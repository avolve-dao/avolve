'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signOut, resetPassword, validateInvitationCode, claimInvitationCode } from '@/lib/auth/auth-utils';
import { identifyUser, resetAnalyticsUser } from '@/lib/analytics/auth-analytics';
import { captureException, setUserContext, clearUserContext } from '@/lib/monitoring/error-tracking';

/**
 * Authentication status type
 */
type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Custom hook for centralized authentication logic
 */
export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Handle sign in
   */
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    setError(null);
    
    const result = await signIn(email, password);
    
    if (!result.success) {
      setStatus('error');
      setError(result.error);
      return false;
    }
    
    // Set user context for analytics and error tracking
    if (result.user) {
      identifyUser(result.user.id, { 
        email: result.user.email,
        created_at: result.user.created_at
      });
      setUserContext(result.user.id, result.user.email);
    }
    
    setStatus('success');
    return true;
  }, []);
  
  /**
   * Handle sign up
   */
  const handleSignUp = useCallback(async (
    email: string, 
    password: string, 
    invitationCode: string,
    metadata: Record<string, any> = {}
  ) => {
    setStatus('loading');
    setError(null);
    
    // First validate the invitation code
    const invitationResult = await validateInvitationCode(invitationCode);
    
    if (!invitationResult.isValid) {
      setStatus('error');
      
      if (invitationResult.reason === 'expired') {
        setError('This invitation code has expired');
      } else if (invitationResult.reason === 'fully_used') {
        setError('This invitation code has already been used');
      } else {
        setError('Invalid invitation code');
      }
      
      return false;
    }
    
    // Proceed with sign up
    const result = await signUp(email, password, invitationCode, metadata);
    
    if (!result.success) {
      setStatus('error');
      setError(result.error);
      return false;
    }
    
    // Set user context for analytics and error tracking
    if (result.user) {
      identifyUser(result.user.id, { 
        email: result.user.email,
        created_at: result.user.created_at,
        ...metadata
      });
      setUserContext(result.user.id, result.user.email, metadata);
      
      // Claim the invitation code
      await claimInvitationCode(invitationCode, result.user.id);
    }
    
    setStatus('success');
    return true;
  }, []);
  
  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(async () => {
    setStatus('loading');
    setError(null);
    
    const result = await signOut();
    
    if (!result.success) {
      setStatus('error');
      setError(result.error);
      return false;
    }
    
    // Clear user context for analytics and error tracking
    resetAnalyticsUser();
    clearUserContext();
    
    setStatus('success');
    
    // Redirect to sign in page
    router.push('/signin');
    
    return true;
  }, [router]);
  
  /**
   * Handle password reset
   */
  const handleResetPassword = useCallback(async (email: string) => {
    setStatus('loading');
    setError(null);
    
    const result = await resetPassword(email);
    
    if (!result.success) {
      setStatus('error');
      setError(result.error);
      return false;
    }
    
    setStatus('success');
    return true;
  }, []);
  
  return {
    status,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handleResetPassword
  };
}

export default useAuth;
