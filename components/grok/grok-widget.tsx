"use client"

import * as React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Maximize2, Minimize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { logActivity } from "@/lib/activity-logger"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface GrokWidgetProps {
  userId: string
  initialPrompt?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function GrokWidget({ userId, initialPrompt, position = "bottom-right" }: GrokWidgetProps) {
  const [isOpen, setIsOpen] = useLocalStorage(`grok-widget-open-${userId}`, false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState(initialPrompt || "")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    "How can I grow my network?",
    "What's trending today?",
    "Help me write a post about AI",
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)

  // Safely handle server-side rendering
  const isBrowser = typeof window !== 'undefined'

  useEffect(() => {
    // Generate a contextual suggestion when the widget is first opened
    if (isBrowser && isOpen && messages.length === 0) {
      const suggestions = [
        "How can I improve my profile to get more followers?",
        "What are the trending topics I should know about?",
        "Can you help me draft a post about my recent activity?",
        "What features of this platform am I not using yet?",
        "How can I connect with more people who share my interests?",
      ]
      setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
    }
  }, [isOpen, messages.length])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isBrowser && isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])

    setIsLoading(true)

    try {
      const response = await fetch("/api/grok/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId,
        }),
      })

      const data = await response.json()

      // Add assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }])

      // Log activity
      logActivity({
        userId,
        action: "message_send",
        entityType: "message",
        entityId: "grok-widget",
        metadata: {
          type: "grok_chat",
          content: input.substring(0, 100),
        },
      })
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
  }

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn("mb-4 overflow-hidden", isExpanded ? "fixed inset-4 z-50" : "w-80")}
          >
            <Card className="flex flex-col h-full shadow-lg border-primary/20 relative overflow-hidden">
              {isOpen && (
                <>
                  <div className="ambient-blob w-[200px] h-[200px] bg-accent-energy/10 bottom-0 right-0"></div>
                  <div className="ambient-blob w-[150px] h-[150px] bg-accent-calm/10 top-[20%] left-0"></div>
                </>
              )}

              <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium">Grok Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent
                className={cn("flex-1 overflow-y-auto p-3", isExpanded ? "max-h-[calc(100vh-8rem)]" : "h-64")}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">Grok Assistant</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Ask me anything about the platform or for help with creating content
                    </p>
                    {suggestion && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setInput(suggestion)
                          setSuggestion(null)
                        }}
                      >
                        "{suggestion}"
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex max-w-[90%] rounded-lg px-3 py-2 text-sm",
                          message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto",
                        )}
                      >
                        {message.content}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex max-w-[90%] rounded-lg px-3 py-2 text-sm bg-muted mr-auto">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce"></div>
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-75"></div>
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-150"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-3 pt-0">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Grok..."
                    className="flex-1 h-8 text-sm"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2" disabled={!input.trim() || isLoading}>
                    <Send className="h-3 w-3" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-energy text-accent-energy-foreground shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  )
}
