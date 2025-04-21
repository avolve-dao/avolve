'use client';

import { createClient } from '@/lib/supabase/client';
import { ActivityType, ActivityLogData } from '@/types/analytics';

export type ActivityActionType = 'page_view' | 'button_click' | 'form_submit' | 'feature_usage' | 'enter_invite_code' | 'select_journey' | 'accept_prime_law';

/**
 * Logs user activity for analytics purposes
 */
export class ActivityLogger {
  private static instance: ActivityLogger;
  private readonly supabase;

  private constructor() {
    this.supabase = createClient();
  }

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  public async logActivity(
    userId: string,
    activityType: ActivityType,
    data?: ActivityLogData
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: activityType,
        details: data?.details || {},
        metadata: {
          ...data?.metadata,
          url: typeof window !== 'undefined' ? window.location.href : null,
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        }
      });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  public async logPageView(
    userId: string,
    page: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    return this.logActivity(userId, 'page_view', {
      details: {
        page,
        ...additionalData,
      }
    });
  }

  public async logButtonClick(
    userId: string,
    buttonId: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    return this.logActivity(userId, 'button_click', {
      details: {
        button_id: buttonId,
        ...additionalData,
      }
    });
  }

  public async logFormSubmit(
    userId: string,
    formId: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    return this.logActivity(userId, 'form_submit', {
      details: {
        form_id: formId,
        ...additionalData,
      }
    });
  }

  public async logFeatureUsage(
    userId: string,
    featureId: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    return this.logActivity(userId, 'feature_usage', {
      details: {
        feature_id: featureId,
        ...additionalData,
      }
    });
  }

  public async getActivityStats(userId: string): Promise<{
    totalActivities: number;
    recentActivities: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: totalActivities, error: totalError } = await this.supabase
        .from('user_activities')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      const { data: recentActivities, error: recentError } = await this.supabase
        .from('user_activities')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (totalError || recentError) {
        console.error('Error fetching activity stats:', totalError || recentError);
        return { totalActivities: 0, recentActivities: 0 };
      }

      return {
        totalActivities: totalActivities?.length || 0,
        recentActivities: recentActivities?.length || 0
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      return { totalActivities: 0, recentActivities: 0 };
    }
  }

  public async getActivityHistory(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting activity history:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const activityLogger = ActivityLogger.getInstance();

/**
 * Convenience function for logging user activity
 * @param data Activity data to log
 */
export const logUserActivity = async (
  userId: string,
  activityType: ActivityType,
  data?: ActivityLogData
): Promise<void> => {
  return activityLogger.logActivity(userId, activityType, data);
};
