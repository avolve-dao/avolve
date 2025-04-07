/**
 * Notification Hook
 * 
 * This hook provides notification-related functionality for React components.
 * It wraps the NotificationService to provide a more React-friendly interface.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/use-auth';
import { 
  NotificationService, 
  Notification, 
  NotificationType 
} from './notification-service';

export interface NotificationContextState {
  isLoading: boolean;
  notifications: Notification[];
  unreadCount: number;
  error: Error | null;
}

export function useNotifications() {
  const { user, authService, isAuthenticated } = useAuth();
  const notificationService = useMemo(() => new NotificationService(authService.getSupabaseClient()), [authService]);
  
  const [state, setState] = useState<NotificationContextState>({
    isLoading: false,
    notifications: [],
    unreadCount: 0,
    error: null
  });

  // Load notifications
  const loadNotifications = useCallback(async (
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ) => {
    if (!user || !isAuthenticated) {
      setState({
        isLoading: false,
        notifications: [],
        unreadCount: 0,
        error: null
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get notifications
      const { data: notifications, error: notificationsError } = await notificationService.getUserNotifications(
        user.id,
        limit,
        offset,
        unreadOnly
      );
      
      if (notificationsError) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: notificationsError 
        }));
        return;
      }
      
      // Get unread count
      const { data: unreadCount, error: countError } = await notificationService.getUnreadNotificationCount(user.id);
      
      if (countError) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: countError 
        }));
        return;
      }
      
      setState({
        isLoading: false,
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
        error: null
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to load notifications')
      }));
    }
  }, [user, isAuthenticated, notificationService]);

  // Load notifications when user changes
  useEffect(() => {
    loadNotifications();
  }, [user, loadNotifications]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user || !isAuthenticated) {
      return;
    }

    // Subscribe to new notifications
    const { unsubscribe } = notificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        // Update state with new notification
        setState(prev => ({
          ...prev,
          notifications: [notification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1
        }));
      }
    );

    // Unsubscribe when component unmounts or user changes
    return () => {
      unsubscribe();
    };
  }, [user, isAuthenticated, notificationService]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user || !isAuthenticated) {
      return { 
        data: null, 
        error: new Error('User not authenticated') 
      };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.markNotificationAsRead(notificationId, user.id);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      // Update state
      setState(prev => {
        const updatedNotifications = prev.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        );
        
        // Only decrement unread count if the notification was previously unread
        const wasUnread = prev.notifications.some(n => n.id === notificationId && !n.is_read);
        const newUnreadCount = wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount;
        
        return {
          ...prev,
          isLoading: false,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount
        };
      });
      
      return result;
    } catch (error) {
      console.error('Mark as read error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to mark notification as read')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to mark notification as read')
      };
    }
  }, [user, isAuthenticated, notificationService]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return { 
        data: null, 
        error: new Error('User not authenticated') 
      };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.markAllNotificationsAsRead(user.id);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      // Update state
      setState(prev => {
        const updatedNotifications = prev.notifications.map(n => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString()
        }));
        
        return {
          ...prev,
          isLoading: false,
          notifications: updatedNotifications,
          unreadCount: 0
        };
      });
      
      return result;
    } catch (error) {
      console.error('Mark all as read error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to mark all notifications as read')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to mark all notifications as read')
      };
    }
  }, [user, isAuthenticated, notificationService]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user || !isAuthenticated) {
      return { 
        data: null, 
        error: new Error('User not authenticated') 
      };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.deleteNotification(notificationId, user.id);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      // Update state
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.is_read;
        
        return {
          ...prev,
          isLoading: false,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
      
      return result;
    } catch (error) {
      console.error('Delete notification error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to delete notification')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to delete notification')
      };
    }
  }, [user, isAuthenticated, notificationService]);

  // Delete all read notifications
  const deleteAllReadNotifications = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return { 
        data: null, 
        error: new Error('User not authenticated') 
      };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.deleteAllReadNotifications(user.id);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return result;
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        isLoading: false,
        notifications: prev.notifications.filter(n => !n.is_read)
      }));
      
      return result;
    } catch (error) {
      console.error('Delete all read notifications error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to delete all read notifications')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to delete all read notifications')
      };
    }
  }, [user, isAuthenticated, notificationService]);

  // Create notification
  const createNotification = useCallback(async (
    userId: string,
    type: NotificationType | string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.createNotification(
        userId,
        type,
        title,
        message,
        link,
        metadata
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      return result;
    } catch (error) {
      console.error('Create notification error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to create notification')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create notification')
      };
    }
  }, [notificationService]);

  // Create token notification
  const createTokenNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    tokenAmount: number,
    tokenSymbol: string,
    transactionId?: string,
    link?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.createTokenNotification(
        userId,
        title,
        message,
        tokenAmount,
        tokenSymbol,
        transactionId,
        link
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      return result;
    } catch (error) {
      console.error('Create token notification error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to create token notification')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create token notification')
      };
    }
  }, [notificationService]);

  // Create consensus notification
  const createConsensusNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    meetingId: string,
    meetingTitle: string,
    link?: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await notificationService.createConsensusNotification(
        userId,
        title,
        message,
        meetingId,
        meetingTitle,
        link
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      return result;
    } catch (error) {
      console.error('Create consensus notification error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to create consensus notification')
      }));
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create consensus notification')
      };
    }
  }, [notificationService]);

  return {
    // State
    ...state,
    
    // Load notifications
    loadNotifications,
    
    // Mark as read
    markAsRead,
    markAllAsRead,
    
    // Delete notifications
    deleteNotification,
    deleteAllReadNotifications,
    
    // Create notifications
    createNotification,
    createTokenNotification,
    createConsensusNotification,
    
    // Service (for direct access if needed)
    notificationService
  };
}
