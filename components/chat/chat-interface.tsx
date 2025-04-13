"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Send, MoreHorizontal, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  chat_id: string
  user_id: string
  content: string
  type: string
  created_at: string
  profiles?: {
    full_name?: string
    avatar_url?: string
  }
}

interface ChatRoom {
  id: string
  name: string
  description?: string
  is_direct: boolean
  is_private: boolean
  created_at: string
}

interface ChatInterfaceProps {
  chatId?: string
  onBack?: () => void
}

export function ChatInterface({ chatId, onBack }: ChatInterfaceProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    fetchUser()
    
    if (chatId) {
      fetchChatRoom()
      fetchMessages()
      subscribeToMessages()
    } else {
      setLoading(false)
    }
    
    return () => {
      // Clean up subscription when component unmounts
      const subscription = supabase.channel('messages')
      subscription.unsubscribe()
    }
  }, [chatId])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }
  
  const fetchChatRoom = async () => {
    if (!chatId) return
    
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatId)
        .single()
        
      if (error) throw error
      
      if (data) {
        setChatRoom(data as ChatRoom)
      }
    } catch (error) {
      console.error('Error fetching chat room:', error)
      toast({
        title: "Error",
        description: "Could not load chat room details.",
        variant: "destructive"
      })
    }
  }
  
  const fetchMessages = async () => {
    if (!chatId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(50)
        
      if (error) throw error
      
      if (data) {
        setMessages(data as Message[])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Could not load chat messages.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const subscribeToMessages = () => {
    if (!chatId) return
    
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          // Fetch the complete message with profile info
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()
            
          if (!error && data) {
            setMessages(prev => [...prev, data as Message])
          }
        }
      )
      .subscribe()
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !chatId || !user) return
    
    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content: newMessage,
          type: 'text'
        })
        
      if (error) throw error
      
      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }
  
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
  if (!chatId) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b px-4 py-3 flex flex-row items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {loading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ) : (
          <>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{chatRoom?.name.charAt(0) || "C"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{chatRoom?.name || "Chat"}</CardTitle>
              {chatRoom?.description && (
                <p className="text-xs text-muted-foreground">{chatRoom.description}</p>
              )}
            </div>
          </>
        )}
        <div className="ml-auto">
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2 max-w-[80%] ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                <div>
                  <Skeleton className="h-4 w-[100px] mb-1" />
                  <Skeleton className="h-10 w-[200px] rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isCurrentUser = message.user_id === user?.id
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.profiles?.avatar_url} />
                      <AvatarFallback>{getInitials(message.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {!isCurrentUser && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {message.profiles?.full_name || "Unknown User"}
                      </p>
                    )}
                    <div className={`p-3 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' 
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(message.created_at))} ago
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending || !chatId}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={sending || !newMessage.trim() || !chatId}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
