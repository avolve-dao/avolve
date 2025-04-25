/**
 * Error handling utilities for the Avolve platform
 * These functions provide consistent error handling and user-friendly error messages
 */

/**
 * Get a user-friendly error message from any error object
 * @param error - The error object
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Get a user-friendly error message for authentication errors
 * @param errorCode - The error code or message
 * @returns A user-friendly error message
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    // Supabase auth errors
    'invalid-email': 'Please enter a valid email address',
    'user-disabled': 'This account has been disabled',
    'user-not-found': 'Invalid email or password',
    'wrong-password': 'Invalid email or password',
    'email-already-in-use': 'An account with this email already exists',
    'weak-password': 'Password should be at least 8 characters long',
    'invalid-login-credentials': 'Invalid email or password',
    'email-not-confirmed': 'Please confirm your email before signing in',
    'user-already-registered': 'An account with this email already exists',
    
    // Invitation code errors
    'invitation-expired': 'This invitation code has expired',
    'invitation-used': 'This invitation code has already been used',
    'invitation-invalid': 'Invalid invitation code',
    'invitation-not-found': 'Invalid invitation code',
    
    // Network errors
    'network-error': 'Network error. Please check your connection and try again',
    'timeout': 'Request timed out. Please try again',
    
    // Generic errors
    'server-error': 'A server error occurred. Please try again later',
    'unknown-error': 'An unexpected error occurred. Please try again',
  };
  
  // Check if the error code is in our mapping
  if (errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }
  
  // Check if the error message contains known patterns
  for (const [key, message] of Object.entries(errorMessages)) {
    if (errorCode.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Default error message
  return 'An error occurred during authentication';
};

/**
 * Format validation errors for form fields
 * @param errors - The validation errors
 * @returns An object with field names as keys and error messages as values
 */
export const formatValidationErrors = (errors: Record<string, any>): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  for (const [field, error] of Object.entries(errors)) {
    if (typeof error === 'string') {
      formattedErrors[field] = error;
    } else if (Array.isArray(error) && error.length > 0) {
      formattedErrors[field] = error[0];
    } else if (error instanceof Error) {
      formattedErrors[field] = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      formattedErrors[field] = String(error.message);
    } else {
      formattedErrors[field] = 'Invalid value';
    }
  }
  
  return formattedErrors;
};

/**
 * Check if an error is a network-related error
 * @param error - The error to check
 * @returns True if the error is network-related, false otherwise
 */
export const isNetworkError = (error: unknown): boolean => {
  const errorMessage = getErrorMessage(error).toLowerCase();
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('unreachable')
  );
};

/**
 * Create a friendly error object with additional context
 * @param message - The error message
 * @param originalError - The original error
 * @param context - Additional context
 * @returns A friendly error object
 */
export const createFriendlyError = (
  message: string,
  originalError?: unknown,
  context: Record<string, any> = {}
): Error & { context?: Record<string, any>; originalError?: unknown } => {
  const friendlyError = new Error(message);
  (friendlyError as any).context = context;
  (friendlyError as any).originalError = originalError;
  return friendlyError as Error & { context?: Record<string, any>; originalError?: unknown };
};
