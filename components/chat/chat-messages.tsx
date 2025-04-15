"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { messagingDb } from "@/lib/db-messaging"
import { EnhancedMessage } from "@/components/chat/enhanced-message"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import { useMessagingTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { RealtimeChannel } from "@supabase/supabase-js"

// Define message types
interface MessageProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  type: string;
  media_url?: string;
  user_id: string;
  created_at: string;
  profiles?: MessageProfile;
}

// Match the exact types expected by EnhancedMessage component
interface EnhancedMessageUser {
  id: string;
  name: string;
  avatar?: string;
}

interface EnhancedReadReceipt {
  user: EnhancedMessageUser;
  readAt: string;
}

interface TypingUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MessagePayload {
  payload: {
    id: string;
    [key: string]: any;
  };
}

interface ReceiptPayload {
  payload: {
    message_id: string;
    [key: string]: any;
  };
}

// Dynamically import the error component
const ErrorDisplay = dynamic(() => import("@/components/error-display"), {
  loading: () => <div className="flex-1 flex items-center justify-center">Loading...</div>,
  ssr: false,
})

interface ChatMessagesProps {
  chatId: string
  userId: string
}

export function ChatMessages({ chatId, userId }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [readReceipts, setReadReceipts] = useState<Record<string, EnhancedReadReceipt[]>>({})
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const { isDark } = useMessagingTheme()
  const supabase = createClient()
  const messageChannelRef = useRef<RealtimeChannel | null>(null)
  const receiptChannelRef = useRef<RealtimeChannel | null>(null)

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await messagingDb.getMessages(chatId)
      setMessages(data)

      // Mark messages as read
      if (data.length > 0) {
        const messageIds = data.filter((msg: Message) => msg.user_id !== userId).map((msg: Message) => msg.id)

        if (messageIds.length > 0) {
          await messagingDb.markMessagesAsRead(chatId, userId, messageIds)
        }

        // Load read receipts
        const allMessageIds = data.map((msg: Message) => msg.id)
        const receipts = await messagingDb.getReadReceipts(allMessageIds)
        setReadReceipts(receipts)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      setError("Failed to load messages. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [chatId, userId])

  // Handle message viewed
  const handleMessageInView = useCallback(
    async (messageId: string) => {
      try {
        await messagingDb.markMessagesAsRead(chatId, userId, [messageId])
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    },
    [chatId, userId],
  )

  // Load typing indicators
  const loadTypingIndicators = useCallback(async () => {
    try {
      const typingIndicators = await messagingDb.getTypingIndicators(chatId, userId)
      setTypingUsers(typingIndicators)
    } catch (error) {
      console.error("Error loading typing indicators:", error)
    }
  }, [chatId, userId])

  // Set up real-time subscriptions
  useEffect(() => {
    loadMessages()

    // Set up polling for typing indicators
    const typingInterval = setInterval(loadTypingIndicators, 3000)

    // Set up real-time subscription for new messages
    const messageChannel = supabase
      .channel(`chat:${chatId}:messages`, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "INSERT" }, async (payload: MessagePayload) => {
        // Fetch the complete message with user data
        const { data } = await supabase
          .from("messages")
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("id", payload.payload.id)
          .single()

        if (data) {
          setMessages((prev) => [...prev, data])

          // Mark message as read if it's not from current user
          if (data.user_id !== userId) {
            await messagingDb.markMessagesAsRead(chatId, userId, [data.id])
          }
        }
      })
      .subscribe()

    messageChannelRef.current = messageChannel

    // Set up real-time subscription for read receipts
    const receiptChannel = supabase
      .channel(`chat:${chatId}:receipts`, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "INSERT" }, async (payload: ReceiptPayload) => {
        // Update read receipts for the message
        const { data } = await supabase
          .from("message_receipts")
          .select(`
            message_id,
            read_at,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("message_id", payload.payload.message_id)
          .single()

        if (data) {
          setReadReceipts((prev) => ({
            ...prev,
            [data.message_id]: [
              ...(prev[data.message_id] || []),
              {
                user: {
                  id: data.profiles.id,
                  name: data.profiles.full_name || data.profiles.username || "Unknown User",
                  avatar: data.profiles.avatar_url || undefined
                },
                readAt: data.read_at,
              },
            ],
          }))
        }
      })
      .subscribe()

    receiptChannelRef.current = receiptChannel

    return () => {
      clearInterval(typingInterval)
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current)
      }
      if (receiptChannelRef.current) {
        supabase.removeChannel(receiptChannelRef.current)
      }
    }
  }, [chatId, userId, supabase, loadMessages, loadTypingIndicators])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, typingUsers])

  // Memoize the skeleton loaders
  const skeletonLoaders = useMemo(
    () => (
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-20 w-[300px] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [],
  )

  if (loading) {
    return skeletonLoaders
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ErrorDisplay message={error} onRetry={loadMessages} />
      </div>
    )
  }

  return (
    <ScrollArea className={cn("flex-1 p-4", isDark ? "bg-zinc-900" : "bg-zinc-50")} ref={scrollAreaRef}>
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center">
          <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            // Ensure we have a valid user ID
            const userId = message.profiles?.id || "unknown-user";
            
            return (
              <EnhancedMessage
                key={message.id}
                message={{
                  id: message.id,
                  content: message.content,
                  type: message.type,
                  media_url: message.media_url,
                  created_at: message.created_at,
                  user: {
                    id: userId,
                    name: message.profiles?.full_name || message.profiles?.username || "Unknown User",
                    avatar: message.profiles?.avatar_url || undefined,
                  },
                }}
                isCurrentUser={message.user_id === userId}
                readReceipts={readReceipts[message.id] || []}
                onInView={message.user_id !== userId ? handleMessageInView : undefined}
                currentUserId={userId}
              />
            );
          })}

          {typingUsers.length > 0 && (
            <TypingIndicator
              users={typingUsers.map((user) => ({
                id: user.id,
                name: user.full_name || user.username || "Unknown User",
                avatar: user.avatar_url || undefined,
              }))}
            />
          )}

          <div ref={lastMessageRef} />
        </div>
      )}
    </ScrollArea>
  )
}
