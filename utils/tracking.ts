/**
 * User Activity Tracking Utility
 *
 * This utility provides functions to track user actions and log them to the database.
 * It integrates with the user_activity_log table to provide comprehensive behavioral tracking.
 */

import { createClient } from '@/lib/supabase/client';
import { Logger } from '@/lib/monitoring/logger';

// Activity action types from the database enum
export type ActivityActionType =
  | 'login'
  | 'logout'
  | 'event_complete'
  | 'vote'
  | 'consent'
  | 'page_view'
  | 'token_claim'
  | 'proposal_create'
  | 'comment'
  | 'profile_update'
  | 'referral'
  | 'notification_read';

interface TrackingOptions {
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const logger = new Logger('ActivityTracking');

/**
 * Tracks a user action by logging it to the user_activity_log table
 *
 * @param userId - The ID of the user performing the action
 * @param actionType - The type of action being performed
 * @param options - Additional tracking options
 * @returns A promise that resolves when the action is logged
 */
export async function trackUserAction(
  userId: string,
  actionType: ActivityActionType,
  options: TrackingOptions = {}
): Promise<{ success: boolean; error?: any }> {
  try {
    const supabase = createClient();

    // Log the action to the database
    const { error } = await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_action_type: actionType,
      p_details: options.details || null,
      p_ip_address: options.ipAddress || null,
      p_user_agent: options.userAgent || null,
    });

    if (error) {
      logger.error('Error tracking user action', error, { userId, actionType, options });
      return { success: false, error };
    }

    logger.info('User action tracked successfully', { userId, actionType });
    return { success: true };
  } catch (error) {
    logger.error('Unexpected error tracking user action', error as Error, { userId, actionType });
    return { success: false, error };
  }
}

/**
 * Tracks a page view
 *
 * @param userId - The ID of the user viewing the page
 * @param pageName - The name of the page being viewed
 * @param options - Additional tracking options
 * @returns A promise that resolves when the page view is logged
 */
export async function trackPageView(
  userId: string,
  pageName: string,
  options: Omit<TrackingOptions, 'details'> = {}
): Promise<{ success: boolean; error?: any }> {
  return trackUserAction(userId, 'page_view', {
    ...options,
    details: { page: pageName },
  });
}

/**
 * Tracks a feature interaction
 *
 * @param userId - The ID of the user interacting with the feature
 * @param featureName - The name of the feature being interacted with
 * @param actionType - The type of action being performed
 * @param options - Additional tracking options
 * @returns A promise that resolves when the interaction is logged
 */
export async function trackFeatureInteraction(
  userId: string,
  featureName: string,
  actionType: ActivityActionType,
  options: Omit<TrackingOptions, 'details'> = {}
): Promise<{ success: boolean; error?: any }> {
  return trackUserAction(userId, actionType, {
    ...options,
    details: { feature_name: featureName },
  });
}

/**
 * Creates a tracking middleware for API routes
 *
 * @param actionType - The default action type for the middleware
 * @returns A middleware function that tracks API requests
 */
export function createTrackingMiddleware(actionType: ActivityActionType) {
  return async (req: any, res: any, next: () => void) => {
    try {
      const userId = req.user?.id;

      if (userId) {
        await trackUserAction(userId, actionType, {
          details: { path: req.path, method: req.method },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      }
    } catch (error) {
      logger.error('Error in tracking middleware', error as Error);
    }

    next();
  };
}

/**
 * React hook for tracking user actions in components
 *
 * @param userId - The ID of the user
 * @returns An object with tracking functions
 */
export function useTracking(userId: string | undefined) {
  return {
    trackAction: (actionType: ActivityActionType, options: TrackingOptions = {}) => {
      if (!userId) return Promise.resolve({ success: false, error: 'No user ID provided' });
      return trackUserAction(userId, actionType, options);
    },

    trackPageView: (pageName: string, options: Omit<TrackingOptions, 'details'> = {}) => {
      if (!userId) return Promise.resolve({ success: false, error: 'No user ID provided' });
      return trackPageView(userId, pageName, options);
    },

    trackFeature: (
      featureName: string,
      actionType: ActivityActionType,
      options: Omit<TrackingOptions, 'details'> = {}
    ) => {
      if (!userId) return Promise.resolve({ success: false, error: 'No user ID provided' });
      return trackFeatureInteraction(userId, featureName, actionType, options);
    },
  };
}
