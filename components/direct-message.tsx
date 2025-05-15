"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { RealtimeChat } from "@/components/realtime-chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface DirectMessageProps {
  currentUserId: string
  currentUserName: string
  recipientId: string
}

export function DirectMessage({ currentUserId, currentUserName, recipientId }: DirectMessageProps) {
  const supabase = createClient()
  const [recipientName, setRecipientName] = useState<string>("")
  const [recipientAvatar, setRecipientAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecipientDetails = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", recipientId)
          .single()

        if (error) {
          console.error("Error fetching recipient details:", error)
          return
        }

        setRecipientName(data.full_name || "Unknown User")
        setRecipientAvatar(data.avatar_url)
      } catch (error) {
        console.error("Error fetching recipient details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipientDetails()
  }, [recipientId, supabase])

  // Mark notifications as read when opening the direct message
  useEffect(() => {
    const markNotificationsAsRead = async () => {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", currentUserId)
          .eq("actor_id", recipientId)
          .eq("type", "message")
      } catch (error) {
        console.error("Error marking notifications as read:", error)
      }
    }

    markNotificationsAsRead()
  }, [currentUserId, recipientId, supabase])

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader className="pb-2 border-b">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback>
                {recipientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{recipientName}</CardTitle>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <RealtimeChat roomName="" username={currentUserName} userId={currentUserId} recipientId={recipientId} />
      </CardContent>
    </Card>
  )
}
