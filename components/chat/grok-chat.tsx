"use client"

import * as React from "react"

import { useState, useRef, useEffect } from "react"
import { nanoid } from "nanoid"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Send, Settings } from "lucide-react"
import { GrokMessage, type ChatMessage } from "@/components/chat/grok-message"
import { GROK_MODELS, DEFAULT_GROK_MODEL, type GrokModel } from "@/lib/xai"
import { cn } from "@/lib/utils"

interface GrokChatProps {
  initialSystemPrompt?: string
}

export function GrokChat({ initialSystemPrompt = "" }: GrokChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [model, setModel] = useState<GrokModel>(DEFAULT_GROK_MODEL)
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isLoading,
    handleSubmit,
    setInput: setChatInput,
  } = useChat({
    api: "/api/chat",
    body: {
      model,
      systemPrompt,
    },
    onResponse: (response) => {
      // This is handled by the streaming UI
    },
    onFinish: (message) => {
      setMessages((prev) => [...prev, { id: nanoid(), role: "assistant", content: message }])
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = { id: nanoid(), role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])

    // Set up AI response
    setChatInput(input)
    setInput("")

    // Add empty assistant message for streaming UI
    setMessages((prev) => [...prev, { id: nanoid(), role: "assistant", content: "" }])
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Grok Chat
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>

      {showSettings && (
        <div className="px-6 pb-4 space-y-4 border-b">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select value={model} onValueChange={(value) => setModel(value as GrokModel)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GROK_MODELS).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instructions for the AI assistant..."
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      )}

      <CardContent
        className={cn("p-4 h-[400px] overflow-y-auto", messages.length === 0 && "flex items-center justify-center")}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with Grok</p>
            <p className="text-sm">Powered by xAI</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <GrokMessage
                key={message.id}
                message={message}
                isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

