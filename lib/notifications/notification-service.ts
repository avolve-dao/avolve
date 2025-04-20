/**
 * Notification Service
 * 
 * This service centralizes all notification-related functionality for the Avolve platform.
 * It provides methods for creating, retrieving, and managing user notifications.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

// Result interface
export interface NotificationResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// Notification interface
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

// Notification type enum
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TOKEN = 'token',
  CONSENSUS = 'consensus',
  SYSTEM = 'system',
  MENTION = 'mention'
}

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

/**
 * Notification Service Class
 */
export class NotificationService {
  private client: SupabaseClient;

  /**
   * Constructor
   */
  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get user notifications
   */
  public async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<NotificationResult<Notification[]>> {
    try {
      let query = this.client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (unreadOnly) {
        query = query.eq('is_read', false);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Get user notifications error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user notifications error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting notifications') 
      };
    }
  }

  /**
   * Get notification by ID
   */
  public async getNotificationById(
    notificationId: string,
    userId: string
  ): Promise<NotificationResult<Notification>> {
    try {
      const { data, error } = await this.client
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Get notification by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get notification by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting notification') 
      };
    }
  }

  /**
   * Get unread notification count
   */
  public async getUnreadNotificationCount(userId: string): Promise<NotificationResult<number>> {
    try {
      const { count, error } = await this.client
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Get unread notification count error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Unexpected get unread notification count error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting unread notification count') 
      };
    }
  }

  /**
   * Create a notification
   */
  public async createNotification(
    userId: string,
    type: NotificationType | string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<NotificationResult<Notification>> {
    try {
      const { data, error } = await this.client
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          link,
          is_read: false,
          metadata
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Create notification error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create notification error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating notification') 
      };
    }
  }

  /**
   * Create a token notification
   */
  public async createTokenNotification(
    userId: string,
    title: string,
    message: string,
    tokenAmount: number,
    tokenSymbol: string,
    transactionId?: string,
    link?: string
  ): Promise<NotificationResult<Notification>> {
    try {
      const metadata = {
        tokenAmount,
        tokenSymbol,
        transactionId
      };
      
      return await this.createNotification(
        userId,
        NotificationType.TOKEN,
        title,
        message,
        link,
        metadata
      );
    } catch (error) {
      console.error('Unexpected create token notification error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating token notification') 
      };
    }
  }

  /**
   * Create a consensus notification
   */
  public async createConsensusNotification(
    userId: string,
    title: string,
    message: string,
    meetingId: string,
    meetingTitle: string,
    link?: string
  ): Promise<NotificationResult<Notification>> {
    try {
      const metadata = {
        meetingId,
        meetingTitle
      };
      
      return await this.createNotification(
        userId,
        NotificationType.CONSENSUS,
        title,
        message,
        link,
        metadata
      );
    } catch (error) {
      console.error('Unexpected create consensus notification error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating consensus notification') 
      };
    }
  }

  /**
   * Create a mention notification
   */
  public async createMentionNotification(
    userId: string,
    title: string,
    message: string,
    mentionedBy: string,
    contextType: string,
    contextId: string,
    link?: string
  ): Promise<NotificationResult<Notification>> {
    try {
      const metadata = {
        mentionedBy,
        contextType,
        contextId
      };
      
      return await this.createNotification(
        userId,
        NotificationType.MENTION,
        title,
        message,
        link,
        metadata
      );
    } catch (error) {
      console.error('Unexpected create mention notification error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating mention notification') 
      };
    }
  }

  /**
   * Mark notification as read
   */
  public async markNotificationAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationResult<boolean>> {
    try {
      const { error } = await this.client
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Mark notification as read error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected mark notification as read error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while marking notification as read') 
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  public async markAllNotificationsAsRead(userId: string): Promise<NotificationResult<number>> {
    try {
      const { data, error } = await this.client.rpc('mark_all_notifications_read', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Mark all notifications as read error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected mark all notifications as read error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while marking all notifications as read') 
      };
    }
  }

  /**
   * Delete notification
   */
  public async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<NotificationResult<boolean>> {
    try {
      const { error } = await this.client
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Delete notification error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected delete notification error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while deleting notification') 
      };
    }
  }

  /**
   * Delete all read notifications
   */
  public async deleteAllReadNotifications(userId: string): Promise<NotificationResult<number>> {
    try {
      const { count, error } = await this.client
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', true);
      
      if (error) {
        console.error('Delete all read notifications error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Unexpected delete all read notifications error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while deleting all read notifications') 
      };
    }
  }

  /**
   * Subscribe to notifications
   * Returns a subscription that can be used to unsubscribe
   */
  public subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): { unsubscribe: () => void } {
    const subscription = this.client
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      }
    };
  }
}
