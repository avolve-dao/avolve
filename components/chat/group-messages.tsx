"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { messagingDb } from "@/lib/db-messaging"
import { Message } from "@/components/chat/message"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface GroupMessagesProps {
  chatId: string
  userId: string
  groupId: string
}

interface MessageData {
  id: string;
  content: string;
  type: string;
  media_url?: string;
  created_at: string;
  user_id: string;
  profiles?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Define the message payload type
interface MessagePayload {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  type: string;
  created_at: string;
}

// Type guard to check if payload has the expected structure
function isValidPayload(payload: any): payload is { new: MessagePayload } {
  return payload && 
         typeof payload === 'object' && 
         payload.new && 
         typeof payload.new === 'object' &&
         typeof payload.new.id === 'string';
}

export function GroupMessages({ chatId, userId, groupId }: GroupMessagesProps) {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await messagingDb.getMessages(chatId)
      setMessages(data)
    } catch (error) {
      console.error("Error loading messages:", error)
      setError("Failed to load messages. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()

    // Set up real-time subscription
    const supabase = messagingDb.getSupabaseClient()

    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          // Check if payload has the expected structure
          if (!isValidPayload(payload)) {
            console.error("Invalid payload structure:", payload);
            return;
          }

          // Fetch the complete message with user data
          const fetchNewMessage = async () => {
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
              .eq("id", payload.new.id)
              .single()

            if (data) {
              setMessages((prev) => [...prev, data as MessageData])
            }
          }

          fetchNewMessage()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [chatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadMessages} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center">
          <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={{
                id: message.id,
                content: message.content,
                type: message.type,
                media_url: message.media_url,
                created_at: message.created_at,
                user: {
                  id: message.profiles?.id || "",
                  name: message.profiles?.full_name || message.profiles?.username || "Unknown User",
                  avatar: message.profiles?.avatar_url,
                },
              }}
              isCurrentUser={message.user_id === userId}
            />
          ))}
          <div ref={lastMessageRef} />
        </div>
      )}
    </ScrollArea>
  )
}
