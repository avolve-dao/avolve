"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useTracking } from "@/utils/tracking"

interface EventChatProps {
  eventId: string;
  userId?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  event_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function EventChat({ eventId, userId: propUserId }: EventChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(propUserId || null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const tracking = useTracking(userId || undefined)

  // Get user ID on mount if not provided as prop
  useEffect(() => {
    if (!userId) {
      const getUserId = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setUserId(session.user.id)
        }
      }

      getUserId()
    }
  }, [supabase, userId])

  // Fetch messages on mount and subscribe to new messages
  useEffect(() => {
    if (!eventId) return

    setIsLoading(true)

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("event_chat_messages")
        .select(`
          id,
          user_id,
          event_id,
          content,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
      } else if (data) {
        // Transform the data to match our ChatMessage interface
        const formattedMessages = data.map(msg => ({
          ...msg,
          profiles: msg.profiles && msg.profiles.length > 0 
            ? {
                full_name: msg.profiles[0]?.full_name || null,
                avatar_url: msg.profiles[0]?.avatar_url || null
              }
            : { full_name: null, avatar_url: null }
        }));
        
        setMessages(formattedMessages)
      }

      setIsLoading(false)
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`event-chat-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_chat_messages",
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          // Fetch the complete message with profile info
          const fetchNewMessage = async () => {
            const { data, error } = await supabase
              .from("event_chat_messages")
              .select(`
                id,
                user_id,
                event_id,
                content,
                created_at,
                profiles (
                  full_name,
                  avatar_url
                )
              `)
              .eq("id", payload.new.id)
              .single()

            if (!error && data) {
              // Transform to match our ChatMessage interface
              const formattedMessage = {
                ...data,
                profiles: data.profiles && data.profiles.length > 0 
                  ? {
                      full_name: data.profiles[0]?.full_name || null,
                      avatar_url: data.profiles[0]?.avatar_url || null
                    }
                  : { full_name: null, avatar_url: null }
              };
              
              setMessages((prev) => [...prev, formattedMessage])
              
              // Scroll to bottom when new message arrives
              setTimeout(() => {
                scrollToBottom()
              }, 100)
            }
          }

          fetchNewMessage()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [eventId, supabase])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !eventId) return

    try {
      const { error } = await supabase
        .from("event_chat_messages")
        .insert({
          user_id: userId,
          event_id: eventId,
          content: newMessage.trim()
        })

      if (error) throw error

      // Track the message send
      tracking.trackAction("comment", {
        details: {
          event_id: eventId,
          content_type: "chat_message"
        }
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Users className="h-12 w-12 mb-2" />
            <p>No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.user_id === userId
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <Avatar>
                  {message.profiles?.avatar_url ? (
                    <AvatarImage src={message.profiles.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      {message.profiles?.full_name
                        ? message.profiles.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`space-y-1 ${
                    message.user_id === userId
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.profiles?.full_name || "Anonymous User"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.user_id === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!newMessage.trim() || !userId}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
