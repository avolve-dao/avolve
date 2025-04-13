/**
 * Notification Context
 * 
 * This context provides notification functionality to all components in the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from './use-notifications';
import { Notification, NotificationType } from './notification-service';

// Create the context
const NotificationContext = createContext<ReturnType<typeof useNotifications> | undefined>(undefined);

// Props for the provider
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Notification Provider Component
 * 
 * This component provides notification functionality to all components in the application.
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Use Notification Context Hook
 * 
 * This hook provides access to the notification context.
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
}

/**
 * With Notifications HOC
 * 
 * This HOC wraps a component and provides it with notification props.
 */
export function withNotifications<P extends object>(
  Component: React.ComponentType<P & { notifications: ReturnType<typeof useNotifications> }>
) {
  return function WithNotificationsComponent(props: P) {
    const notifications = useNotificationContext();
    
    return <Component {...props} notifications={notifications} />;
  };
}

/**
 * Notification Badge Component
 * 
 * This component displays a badge with the number of unread notifications.
 */
interface NotificationBadgeProps {
  className?: string;
  max?: number;
}

export function NotificationBadge({ className = '', max = 99 }: NotificationBadgeProps) {
  const { unreadCount } = useNotificationContext();
  
  if (unreadCount === 0) {
    return null;
  }
  
  const displayCount = unreadCount > max ? `${max}+` : unreadCount;
  
  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${className}`}>
      {displayCount}
    </span>
  );
}

/**
 * Notification List Component
 * 
 * This component displays a list of notifications.
 */
interface NotificationListProps {
  limit?: number;
  onNotificationClick?: (notification: Notification) => void;
  emptyMessage?: string;
  className?: string;
}

export function NotificationList({ 
  limit = 10, 
  onNotificationClick,
  emptyMessage = 'No notifications',
  className = ''
}: NotificationListProps) {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    loadNotifications 
  } = useNotificationContext();
  
  React.useEffect(() => {
    loadNotifications(limit, 0);
  }, [loadNotifications, limit]);
  
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {notifications.slice(0, limit).map((notification) => (
        <div 
          key={notification.id}
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="text-sm text-gray-500">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(notification.created_at)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Notification Dropdown Component
 * 
 * This component displays a dropdown with notifications.
 */
interface NotificationDropdownProps {
  trigger: React.ReactNode;
  limit?: number;
  onNotificationClick?: (notification: Notification) => void;
  emptyMessage?: string;
  className?: string;
}

export function NotificationDropdown({
  trigger,
  limit = 5,
  onNotificationClick,
  emptyMessage = 'No notifications',
  className = ''
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { markAllAsRead } = useNotificationContext();
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden">
          <div className="p-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          </div>
          
          <NotificationList 
            limit={limit} 
            onNotificationClick={handleNotificationClick}
            emptyMessage={emptyMessage}
          />
          
          <div className="p-2 border-t border-gray-200">
            <button 
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get notification icon based on type
function getNotificationIcon(type: string) {
  switch (type) {
    case NotificationType.SUCCESS:
      return (
        <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case NotificationType.ERROR:
      return (
        <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case NotificationType.WARNING:
      return (
        <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case NotificationType.TOKEN:
      return (
        <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case NotificationType.CONSENSUS:
      return (
        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </span>
      );
    case NotificationType.MENTION:
      return (
        <span className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-pink-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
          </svg>
        </span>
      );
    default:
      return (
        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </span>
      );
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString();
}
