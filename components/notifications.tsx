"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  message: string
  is_read: boolean
  created_at: string
  actor_id: string
  type: string
  post_id: string | null
  comment_id: string | null
  actor_name?: string
  actor_avatar?: string
}

export function NotificationsPopover({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*, profiles!actor_id(full_name, avatar_url)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      // Format the notifications with actor details
      const formattedNotifications = data.map((notification) => ({
        ...notification,
        actor_name: notification.profiles?.full_name || "Unknown User",
        actor_avatar: notification.profiles?.avatar_url || null,
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id)

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
    }

    // Navigate based on notification type
    if (notification.type === "message") {
      router.push(`/messages/${notification.actor_id}`)
    }

    setIsOpen(false)
  }

  const markAllAsRead = async () => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-0 cursor-pointer hover:bg-accent ${
                  !notification.is_read ? "bg-accent/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.actor_avatar || undefined} />
                    <AvatarFallback>
                      {notification.actor_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
