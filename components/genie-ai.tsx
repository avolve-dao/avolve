"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, Send, User, Bot, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function GenieAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "I'm your Genie AI assistant for the Supercivilization. I can help guide you on your journey from Degen to Regen. What would you like to know about creating value and transforming your thinking?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

          if (data && data.full_name) {
            setUserName(data.full_name)
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
    const loadConversationHistory = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase
            .from("genie_conversations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })
            .limit(50)

          if (error) {
            console.error("Error loading conversation history:", error)
            return
          }

          if (data && data.length > 0) {
            const loadedMessages: Message[] = data.map((msg) => ({
              id: msg.message_id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              timestamp: new Date(msg.created_at),
            }))

            setMessages(loadedMessages)
          }
        }
      } catch (error) {
        console.error("Error loading conversation history:", error)
      }
    }

    loadConversationHistory()
  }, [supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

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
      // Save user message to database
      await saveMessageToDatabase(userMessage)

      // Create the prompt with context about Degen to Regen transformation
      const prompt = `
        You are Genie AI, a helpful assistant for the Avolve platform that guides users on their journey from Degen (extractive, zero-sum thinking) to Regen (regenerative, positive-sum thinking).
        
        The Supercivilization is based on mankind's mentality:
        - Most people are Degens stuck in a follower mentality which enables the Anticivilization with its parasitical elite ruling class
        - Regens are self-leaders, integrated thinkers, and value creators/producers who benefit themselves, others, society, and the environment
        - The Degen Anticivilization is a zero-sum game
        - The Regen Supercivilization is a positive-sum game
        
        Your goal is to help the user Avolve from Degen to Regen faster by:
        - Helping them create their success puzzle faster for better individual quality of lifestyle
        - Helping them co-create the superpuzzle faster for better collective standard of living
        
        ${userName ? `The user's name is ${userName}.` : ""}
        
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

      // Save assistant message to database
      await saveMessageToDatabase(assistantMessage)

      // Record token transaction for using Genie AI
      await recordTokenTransaction(-5, "Used Genie AI")
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

  const saveMessageToDatabase = async (message: Message) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase.from("genie_conversations").insert({
          user_id: user.id,
          message_id: message.id,
          role: message.role,
          content: message.content,
          created_at: message.timestamp.toISOString(),
        })

        if (error) {
          console.error("Error saving message to database:", error)
        }
      }
    } catch (error) {
      console.error("Error saving message to database:", error)
    }
  }

  const recordTokenTransaction = async (amount: number, description: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Record the transaction
        await supabase.from("token_transactions").insert({
          user_id: user.id,
          amount: amount,
          description: description,
          token_type: "GEN",
        })

        // Update user's token balance
        await supabase.rpc("update_token_balance", {
          user_id_param: user.id,
          token_type_param: "GEN",
          amount_param: amount,
        })
      }
    } catch (error) {
      console.error("Error recording token transaction:", error)
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Genie AI
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>5 GEN per question</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pb-0">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex gap-3 max-w-[80%]">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/vintage-desk-lamp.png" />
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
                  <Avatar className="h-8 w-8">
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
      <CardFooter className="pt-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask about your Degen to Regen transformation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
