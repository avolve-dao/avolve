"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Send, User, Bot, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { TOKEN_COSTS } from "@/constants"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function GenieAIChat() {
  const { user, profile, tokenBalance, refreshTokenBalance } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  // Initialize with welcome message
  useEffect(() => {
    if (profile?.full_name) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Hello ${profile.full_name}! I'm your Genie AI assistant. I can help you on your journey from Degen to Regen thinking. What would you like to know about transforming your approach to success?`,
          timestamp: new Date(),
        },
      ])
    }
  }, [profile?.full_name])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !user?.id) return
    if (tokenBalance < TOKEN_COSTS.GENIE_AI_QUESTION) {
      toast({
        title: "Not enough GEN tokens",
        description: `You need at least ${TOKEN_COSTS.GENIE_AI_QUESTION} GEN tokens to use Genie AI.`,
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create the prompt with context about Degen to Regen transformation
      const prompt = `
        You are Genie AI, a helpful assistant for the Avolve platform that guides users on their journey from Degen (extractive, zero-sum thinking) to Regen (regenerative, positive-sum thinking).
        
        The Degen mindset is characterized by:
        - Extracting value from systems and people for personal gain
        - Competing for limited resources in zero-sum games
        - Measuring success by comparison to others
        - Remaining trapped in biological survival patterns
        - Prioritizing individual achievement at the expense of collective wellbeing
        
        The Regen mindset is characterized by:
        - Creating regenerative value that benefits all stakeholders
        - Building systems that generate abundance
        - Measuring success by positive impact on self, others, and ecosystems
        - Transcending biological survival patterns
        - Collaborating to create emergent solutions
        
        The user's name is ${profile?.full_name || "there"}.
        
        Previous conversation:
        ${messages.map((m) => `${m.role === "user" ? "User" : "Genie"}: ${m.content}`).join("\n")}
        
        User: ${input}
        
        Provide a helpful, insightful response that guides the user toward Regen thinking. Be concise but impactful.
        
        Genie:
      `

      // Generate response using Grok
      const { text } = await generateText({
        model: xai("grok"),
        prompt: prompt,
        maxTokens: 500,
      })

      // Add assistant response to messages
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Record token transaction for using Genie AI
      await supabase.from("token_transactions").insert({
        user_id: user.id,
        amount: -TOKEN_COSTS.GENIE_AI_QUESTION,
        description: "Used Genie AI",
        token_type: "GEN",
      })

      // Refresh token balance
      await refreshTokenBalance()

      // Save conversation to database
      await saveConversation(userMessage, assistantMessage)
    } catch (error) {
      console.error("Error generating response:", error)

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const saveConversation = async (userMessage: Message, assistantMessage: Message) => {
    if (!user?.id) return

    try {
      // Save both messages to the database
      await supabase.from("genie_conversations").insert([
        {
          user_id: user.id,
          message_id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content,
          created_at: userMessage.timestamp.toISOString(),
        },
        {
          user_id: user.id,
          message_id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          created_at: assistantMessage.timestamp.toISOString(),
        },
      ])
    } catch (error) {
      console.error("Error saving conversation:", error)
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Genie AI
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                    <Info className="h-3 w-3" />
                    <span>{TOKEN_COSTS.GENIE_AI_QUESTION} GEN per question</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Each question costs {TOKEN_COSTS.GENIE_AI_QUESTION} GEN tokens</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 text-foreground"
            >
              {tokenBalance} GEN
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex gap-3 max-w-[80%]">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-r from-zinc-400 to-zinc-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                  <div className="text-xs mt-1 opacity-50">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask Genie AI a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || tokenBalance < TOKEN_COSTS.GENIE_AI_QUESTION}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim() || tokenBalance < TOKEN_COSTS.GENIE_AI_QUESTION}>
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
