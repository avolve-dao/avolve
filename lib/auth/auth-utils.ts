/**
 * Authentication utilities for the Avolve platform
 * These functions handle user authentication, registration, and related operations
 */
import { createClient } from '@supabase/supabase-js';
import { captureException } from '@/lib/monitoring/error-tracking';
import { logAuthEvent } from '@/lib/analytics/auth-analytics';

// Maximum number of retries for auth operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Initialize Supabase client
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Helper function to implement retry logic
 * @param operation - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Delay between retries in ms
 * @returns Promise resolving to the operation result
 */
async function withRetry<T>(operation: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      
      // Convert to Error object if it's not already
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry for certain errors (e.g., invalid credentials)
      if (errorObj.message?.includes('Invalid login credentials') || 
          errorObj.message?.includes('Email not confirmed') ||
          errorObj.message?.includes('Invalid email')) {
        throw errorObj;
      }
      
      // Only retry for network-related errors
      if (!errorObj.message?.includes('network') && 
          !errorObj.message?.includes('timeout') && 
          !errorObj.message?.includes('connection')) {
        throw errorObj;
      }
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Signs in a user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns Promise resolving to the sign-in result
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = getSupabaseClient();
    
    const operation = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log specific auth errors for monitoring
        if (error.message.includes('Invalid login credentials')) {
          logAuthEvent('sign_in_invalid_credentials', { email });
        } else if (error.message.includes('Email not confirmed')) {
          logAuthEvent('sign_in_email_not_confirmed', { email });
        } else {
          logAuthEvent('sign_in_error', { email, error: error.message });
        }
        
        throw error;
      }

      // Log successful sign-in
      logAuthEvent('sign_in_success', { email, userId: data.user?.id });
      
      return { data, error: null };
    };
    
    const { data, error } = await withRetry(operation);
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    captureException('Error signing in', errorObj, { email });
    console.error('Error signing in:', errorObj);
    
    // Provide more user-friendly error messages
    let errorMessage = 'An error occurred during sign in';
    if (errorObj.message?.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password';
    } else if (errorObj.message?.includes('Email not confirmed')) {
      errorMessage = 'Please confirm your email before signing in';
    } else if (errorObj.message?.includes('network') || errorObj.message?.includes('timeout')) {
      errorMessage = 'Network error. Please check your connection and try again';
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Registers a new user with email, password, and optional metadata
 * @param email - User's email
 * @param password - User's password
 * @param metadata - Additional user metadata
 * @param invitationCode - Optional invitation code for closed registration
 * @returns Promise resolving to the sign-up result
 */
export async function signUp(
  email: string,
  password: string,
  metadata: Record<string, any> = {},
  invitationCode?: string
) {
  try {
    const supabase = getSupabaseClient();
    
    // Validate invitation code if provided
    if (invitationCode) {
      const validationResult = await validateInvitationCode(invitationCode);
      if (!validationResult.isValid) {
        // Log invalid invitation attempt
        logAuthEvent('sign_up_invalid_invitation', { email, invitationCode });
        
        // Provide specific error message based on validation result
        let errorMessage = 'Invalid invitation code';
        if (validationResult.reason === 'expired') {
          errorMessage = 'This invitation code has expired';
        } else if (validationResult.reason === 'fully_used') {
          errorMessage = 'This invitation code has reached its maximum number of uses';
        } else if (validationResult.reason === 'not_found') {
          errorMessage = 'Invitation code not found';
        }
        
        return { success: false, error: errorMessage };
      }
      
      // Log valid invitation code
      logAuthEvent('sign_up_valid_invitation', { email, invitationCode });
    }

    const operation = async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            invitation_code: invitationCode,
            signup_timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) {
        // Log specific auth errors for monitoring
        if (error.message.includes('User already registered')) {
          logAuthEvent('sign_up_user_exists', { email });
        } else {
          logAuthEvent('sign_up_error', { email, error: error.message });
        }
        
        throw error;
      }
      
      return { data, error: null };
    };
    
    const { data, error } = await withRetry(operation);
    
    if (error) {
      return { success: false, error: error.message };
    }

    // If invitation code was used, mark it as claimed
    if (invitationCode && data.user) {
      const claimResult = await claimInvitationCode(invitationCode, data.user.id);
      if (!claimResult.success) {
        // Log claim failure but don't fail the signup
        captureException('Error claiming invitation code', new Error(claimResult.error), {
          email,
          userId: data.user.id,
          invitationCode
        });
      }
    }
    
    // Log successful sign-up
    logAuthEvent('sign_up_success', { 
      email, 
      userId: data.user?.id,
      hasInvitation: !!invitationCode
    });

    return { success: true, user: data.user, session: data.session };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    captureException('Error signing up', errorObj, { email, hasInvitation: !!invitationCode });
    console.error('Error signing up:', errorObj);
    
    // Provide more user-friendly error messages
    let errorMessage = 'An error occurred during sign up';
    if (errorObj.message?.includes('User already registered')) {
      errorMessage = 'An account with this email already exists';
    } else if (errorObj.message?.includes('Password should be at least')) {
      errorMessage = 'Password should be at least 8 characters long';
    } else if (errorObj.message?.includes('network') || errorObj.message?.includes('timeout')) {
      errorMessage = 'Network error. Please check your connection and try again';
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Signs out the current user
 * @returns Promise resolving to the sign-out result
 */
export async function signOut() {
  try {
    const supabase = getSupabaseClient();
    
    // Get user before signing out for analytics
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    const operation = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    };
    
    const { error } = await withRetry(operation);

    if (error) {
      // Log sign-out error
      logAuthEvent('sign_out_error', { userId, error: error.message });
      return { success: false, error: error.message };
    }
    
    // Log successful sign-out
    logAuthEvent('sign_out_success', { userId });
    return { success: true };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    captureException('Error signing out', errorObj);
    console.error('Error signing out:', errorObj);
    return { success: false, error: 'An error occurred during sign out. You have been signed out locally, but there might be issues with the server.' };
  }
}

/**
 * Initiates a password reset for a user
 * @param email - User's email
 * @returns Promise resolving to the password reset result
 */
export async function resetPassword(email: string) {
  try {
    const supabase = getSupabaseClient();
    
    const operation = async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://avolve.io'}/update-password`,
      });
      
      if (error) throw error;
      return { error: null };
    };
    
    const { error } = await withRetry(operation);

    if (error) {
      // Log password reset error
      logAuthEvent('password_reset_error', { email, error: error.message });
      return { success: false, error: error.message };
    }
    
    // Log successful password reset request
    logAuthEvent('password_reset_requested', { email });
    return { success: true };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    captureException('Error resetting password', errorObj, { email });
    console.error('Error resetting password:', errorObj);
    
    // Don't reveal if the email exists or not for security
    return { 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    };
  }
}

/**
 * Validates an invitation code
 * @param code - The invitation code to validate
 * @returns Promise resolving to validation result
 */
export async function validateInvitationCode(code: string): Promise<{ 
  isValid: boolean, 
  invitation?: any,
  reason?: 'expired' | 'fully_used' | 'invalid' | 'not_found' 
}> {
  try {
    const supabase = getSupabaseClient();
    
    const operation = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', code)
        .single();
        
      if (error) throw error;
      return { data, error: null };
    };
    
    const { data, error } = await withRetry(operation);

    if (error || !data) {
      return { isValid: false, reason: 'not_found' };
    }

    // Check if the invitation is valid
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    const isExpired = expiresAt < now;
    const isFullyUsed = data.current_uses >= data.max_uses;

    if (isExpired) {
      return { isValid: false, reason: 'expired' };
    }
    
    if (isFullyUsed) {
      return { isValid: false, reason: 'fully_used' };
    }
    
    if (!data.is_valid) {
      return { isValid: false, reason: 'invalid' };
    }

    return { 
      isValid: true,
      invitation: data
    };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    captureException('Error validating invitation code', errorObj, { code });
    console.error('Error validating invitation code:', errorObj);
    return { isValid: false, reason: 'not_found' };
  }
}

/**
 * Claims an invitation code for a user
 * @param code - The invitation code to claim
 * @param userId - The user ID claiming the code
 * @returns Promise resolving to the claim result
 */
async function claimInvitationCode(code: string, userId: string) {
  try {
    const supabase = getSupabaseClient();
    
    // First get the current invitation
    const operation1 = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', code)
        .single();
        
      if (error) throw error;
      return { data, error: null };
    };
    
    const { data: invitation, error: fetchError } = await withRetry(operation1);

    if (fetchError || !invitation) {
      logAuthEvent('invitation_claim_not_found', { userId, code });
      return { success: false, error: 'Invitation not found' };
    }

    // Update the used count
    const operation2 = async () => {
      const { error } = await supabase
        .from('invitations')
        .update({ 
          current_uses: invitation.current_uses + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
        
      if (error) throw error;
      return { error: null };
    };
    
    const { error: updateError } = await withRetry(operation2);

    if (updateError) {
      logAuthEvent('invitation_update_error', { userId, code, error: updateError.message });
      return { success: false, error: updateError.message };
    }

    // Record the claim
    const operation3 = async () => {
      const { error } = await supabase
        .from('invitation_claims')
        .insert({
          invitation_id: invitation.id,
          user_id: userId,
          claimed_at: new Date().toISOString(),
          invitation_code: code
        });
        
      if (error) throw error;
      return { error: null };
    };
    
    const { error: claimError } = await withRetry(operation3);

    if (claimError) {
      logAuthEvent('invitation_claim_error', { userId, code, error: claimError.message });
      return { success: false, error: claimError.message };
    }
    
    // Log successful claim
    logAuthEvent('invitation_claimed', { 
      userId, 
      code, 
      invitationId: invitation.id,
      inviterUserId: invitation.created_by
    });

    return { success: true };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    captureException('Error claiming invitation code', errorObj, { code, userId });
    console.error('Error claiming invitation code:', errorObj);
    return { success: false, error: errorObj.message || 'An error occurred claiming invitation code' };
  }
}
