"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTracking } from "@/utils/tracking"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  title: string
  message: string
  type: "feedback" | "event" | "system"
  created_at: string
  is_read: boolean
}

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const tracking = useTracking(userId)
  const supabase = createClient()

  // Load initial notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error
        
        if (data) {
          setNotifications(data)
          setUnreadCount(data.filter((n: { is_read: boolean }) => !n.is_read).length)
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }

    if (userId) {
      loadNotifications()
    }
  }, [userId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return

    // Subscribe to feedback updates
    const feedbackChannel = supabase.channel('feedback-updates');
    feedbackChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_feedback',
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => {
        if (payload.new && (payload.new.user_id === userId)) {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            title: 'Feedback Received',
            message: `Thank you for your feedback on ${payload.new.category}`,
            type: 'feedback',
            created_at: new Date().toISOString(),
            is_read: false,
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      }
    );
    feedbackChannel.subscribe();

    // Subscribe to event updates
    const eventChannel = supabase.channel('event-updates');
    eventChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'events',
        filter: 'is_completed=eq.true',
      },
      (payload: any) => {
        if (payload.new) {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            title: 'Event Completed',
            message: `SSA event completed by ${payload.new.completed_by_count} users!`,
            type: 'event',
            created_at: new Date().toISOString(),
            is_read: false,
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      }
    );
    eventChannel.subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(eventChannel);
    };
  }, [userId])

  // Mark notifications as read
  const markAsRead = async (notificationId?: string) => {
    try {
      if (notificationId) {
        // Mark specific notification as read
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
        
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
      } else {
        // Mark all as read
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId)
        
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
      }
      
      // Update unread count
      setUnreadCount(0)
      
      // Track the action
      tracking.trackAction('notification_read')
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  // Handle dropdown open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && unreadCount > 0) {
      markAsRead()
    }
  }

  // Format the notification time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAsRead()}
              className="h-8 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 ${
                  !notification.is_read ? 'bg-muted/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center text-center"
          onClick={() => {
            router.push('/notifications')
            setIsOpen(false)
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
