"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

interface UseRealtimeChatProps {
  roomName: string
  recipientId?: string
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
    id: string
  }
  createdAt: string
  file_url?: string
  file_type?: string
}

const EVENT_MESSAGE_TYPE = "message"

export function useRealtimeChat({ roomName, recipientId }: UseRealtimeChatProps) {
  const supabase = createClient()
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Fetch existing messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        let query = supabase.from("messages").select("*, profiles(full_name, avatar_url)")

        if (recipientId) {
          // Direct messages
          query = query
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
            .eq("is_direct", true)
        } else {
          // Room messages
          query = query.eq("room_id", roomName).eq("is_direct", false)
        }

        const { data, error } = await query.order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching messages:", error)
          return
        }

        if (data) {
          const formattedMessages: ChatMessage[] = data.map((msg) => ({
            id: msg.id,
            content: msg.content,
            user: {
              name: msg.profiles?.full_name || "Unknown",
              id: msg.sender_id,
            },
            createdAt: msg.created_at,
            file_url: msg.file_url,
            file_type: msg.file_type,
          }))

          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchMessages()
    }
  }, [roomName, recipientId, user, supabase])

  // Set up realtime subscription using Broadcast
  useEffect(() => {
    if (!user) return

    const channelName = recipientId ? `direct:${[user.id, recipientId].sort().join("-")}` : `room:${roomName}`

    const newChannel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: false,
        },
      },
    })

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
        }
      })

    setChannel(newChannel)

    // Also subscribe to database changes as a fallback
    const messagesChannel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: recipientId ? `is_direct=eq.true` : `room_id=eq.${roomName}`,
        },
        async (payload) => {
          // Only process if it's relevant to this chat
          if (recipientId) {
            const { sender_id, recipient_id } = payload.new
            const relevantUserIds = [user.id, recipientId].sort().join("-")
            const messageUserIds = [sender_id, recipient_id].sort().join("-")

            if (relevantUserIds !== messageUserIds) return
          }

          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", payload.new.sender_id)
            .single()

          const newMessage: ChatMessage = {
            id: payload.new.id,
            content: payload.new.content,
            user: {
              name: userData?.full_name || "Unknown",
              id: payload.new.sender_id,
            },
            createdAt: payload.new.created_at,
            file_url: payload.new.file_url,
            file_type: payload.new.file_type,
          }

          // Only add if not already in the list (avoid duplicates from broadcast)
          setMessages((current) => {
            if (!current.some((msg) => msg.id === newMessage.id)) {
              return [...current, newMessage]
            }
            return current
          })
        },
      )
      .subscribe()

    return () => {
      if (newChannel) supabase.removeChannel(newChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [roomName, user, recipientId, supabase])

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, fileUrl?: string, fileType?: string) => {
      if (!content.trim() || !user || isSending) return

      setIsSending(true)

      try {
        const messageId = crypto.randomUUID()

        // Create the message object
        const message: ChatMessage = {
          id: messageId,
          content,
          user: {
            name: user.full_name || user.email || "User",
            id: user.id,
          },
          createdAt: new Date().toISOString(),
          file_url: fileUrl,
          file_type: fileType,
        }

        // Update local state immediately for the sender
        setMessages((current) => [...current, message])

        // Store message in database
        const { error } = await supabase.from("messages").insert({
          id: messageId,
          content,
          room_id: recipientId ? null : roomName,
          sender_id: user.id,
          recipient_id: recipientId || null,
          is_direct: !!recipientId,
          sender_name: user.full_name || user.email || "User",
          file_url: fileUrl,
          file_type: fileType,
        })

        if (error) {
          console.error("Error storing message:", error)
          // Remove the message from local state if it failed to save
          setMessages((current) => current.filter((msg) => msg.id !== messageId))
          return
        }

        // Broadcast message to other users
        if (channel && isConnected) {
          await channel.send({
            type: "broadcast",
            event: EVENT_MESSAGE_TYPE,
            payload: message,
          })
        }

        // Create notification for direct messages
        if (recipientId) {
          await supabase.from("notifications").insert({
            user_id: recipientId,
            actor_id: user.id,
            type: "message",
            message: `New message from ${user.full_name || user.email || "User"}`,
            is_read: false,
          })
        }
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsSending(false)
      }
    },
    [channel, isConnected, user, roomName, recipientId, isSending, supabase],
  )

  return { messages, sendMessage, isLoading, isSending }
}
