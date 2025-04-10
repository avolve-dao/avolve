'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

export type ActivityActionType = 'page_view' | 'button_click' | 'form_submit' | 'feature_usage';

export interface ActivityLogData {
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Logs user activity for analytics purposes
 */
export class ActivityLogger {
  private supabase = createClientComponentClient<Database>();
  
  /**
   * Log a user activity
   * @param action The type of action being performed
   * @param data Additional data about the action
   * @returns Promise resolving to the result of the logging operation
   */
  async logActivity(action: ActivityActionType, data?: ActivityLogData): Promise<{ success: boolean; error?: any }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        console.warn('Activity logging attempted without authenticated user');
        return { success: false, error: 'No authenticated user' };
      }
      
      // Insert activity log
      const { error } = await this.supabase
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          action_type: action,
          details: data?.details || {},
          metadata: {
            ...data?.metadata,
            url: typeof window !== 'undefined' ? window.location.href : null,
            referrer: typeof document !== 'undefined' ? document.referrer : null,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          },
        });
      
      if (error) {
        console.error('Error logging activity:', error);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in activity logger:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Log a page view
   * @param page The page being viewed
   * @param additionalData Additional data about the page view
   */
  async logPageView(page: string, additionalData?: Record<string, any>): Promise<{ success: boolean; error?: any }> {
    return this.logActivity('page_view', {
      details: {
        page,
        ...additionalData,
      },
    });
  }
  
  /**
   * Log a button click
   * @param buttonId The ID or name of the button
   * @param additionalData Additional data about the button click
   */
  async logButtonClick(buttonId: string, additionalData?: Record<string, any>): Promise<{ success: boolean; error?: any }> {
    return this.logActivity('button_click', {
      details: {
        button_id: buttonId,
        ...additionalData,
      },
    });
  }
  
  /**
   * Log a form submission
   * @param formId The ID or name of the form
   * @param additionalData Additional data about the form submission
   */
  async logFormSubmit(formId: string, additionalData?: Record<string, any>): Promise<{ success: boolean; error?: any }> {
    return this.logActivity('form_submit', {
      details: {
        form_id: formId,
        ...additionalData,
      },
    });
  }
  
  /**
   * Log feature usage
   * @param featureId The ID or name of the feature
   * @param additionalData Additional data about the feature usage
   */
  async logFeatureUsage(featureId: string, additionalData?: Record<string, any>): Promise<{ success: boolean; error?: any }> {
    return this.logActivity('feature_usage', {
      details: {
        feature_id: featureId,
        ...additionalData,
      },
    });
  }
}

// Export a singleton instance
export const activityLogger = new ActivityLogger();
