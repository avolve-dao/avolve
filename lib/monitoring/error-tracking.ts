/**
 * Error tracking utilities for the Avolve platform
 * These functions handle error capture, logging, and reporting to monitoring services
 */

// Import monitoring services as needed
// import * as Sentry from '@sentry/nextjs';

/**
 * Captures an exception and sends it to the monitoring service
 * @param message - Error message
 * @param error - Error object
 * @param context - Additional context for the error
 */
export function captureException(message: string, error: Error | unknown, context: Record<string, any> = {}) {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${message}:`, error, context);
  }

  // In production, we would send to a monitoring service like Sentry
  if (process.env.NODE_ENV === 'production') {
    try {
      // Format error for logging
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Add context to error
      const errorWithContext = {
        ...errorObj,
        message: `${message}: ${errorObj.message}`,
        context,
        timestamp: new Date().toISOString(),
      };
      
      // Send to monitoring service
      // Sentry.captureException(errorWithContext);
      
      // You could also send to a custom endpoint
      if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: errorWithContext.message,
            stack: errorObj.stack,
            context: errorWithContext.context,
            timestamp: errorWithContext.timestamp,
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          }),
        }).catch(e => console.error('Failed to send error to tracking endpoint:', e));
      }
    } catch (e) {
      // Fallback if error tracking itself fails
      console.error('Error in error tracking:', e);
    }
  }
}

/**
 * Captures a message and sends it to the monitoring service
 * @param message - Message to capture
 * @param context - Additional context for the message
 * @param level - Log level (info, warning, error)
 */
export function captureMessage(message: string, context: Record<string, any> = {}, level: 'info' | 'warning' | 'error' = 'info') {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console[level](`[${level.toUpperCase()}] ${message}:`, context);
  }

  // In production, we would send to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Send to monitoring service
      // Sentry.captureMessage(message, { level, extra: context });
      
      // You could also send to a custom endpoint
      if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            level,
            context,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          }),
        }).catch(e => console.error('Failed to send message to tracking endpoint:', e));
      }
    } catch (e) {
      // Fallback if message tracking itself fails
      console.error('Error in message tracking:', e);
    }
  }
}

/**
 * Sets user context for error tracking
 * @param userId - User ID
 * @param email - User email
 * @param metadata - Additional user metadata
 */
export function setUserContext(userId: string, email?: string, metadata: Record<string, any> = {}) {
  if (process.env.NODE_ENV === 'production') {
    try {
      // Set user context in monitoring service
      // Sentry.setUser({
      //   id: userId,
      //   email,
      //   ...metadata,
      // });
    } catch (e) {
      console.error('Error setting user context:', e);
    }
  }
}

/**
 * Clears user context for error tracking
 */
export function clearUserContext() {
  if (process.env.NODE_ENV === 'production') {
    try {
      // Clear user context in monitoring service
      // Sentry.setUser(null);
    } catch (e) {
      console.error('Error clearing user context:', e);
    }
  }
}
