'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock notifications - in a real app, these would come from the database
const mockNotifications = [
  {
    id: '1',
    title: 'New friend request',
    description: 'Alex sent you a friend request',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    title: 'New message',
    description: 'Sarah sent you a message',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Post liked',
    description: 'Michael liked your post',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    title: 'Comment on your post',
    description: 'Emma commented on your post',
    time: '5 hours ago',
    read: true,
  },
];

export function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs px-2"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="grid gap-1">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  className={cn(
                    'flex flex-col gap-1 p-4 text-left transition-colors hover:bg-accent',
                    !notification.read && 'bg-accent/50'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid gap-0.5">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.description}
                      </div>
                      <div className="text-xs text-muted-foreground">{notification.time}</div>
                    </div>
                    {!notification.read && <div className="flex h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No notifications</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
