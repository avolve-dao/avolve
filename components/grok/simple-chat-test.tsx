"use client"

import * as React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send } from "lucide-react"

export function SimpleChatTest() {
  const [input, setInput] = useState("")

  const {
    messages,
    isLoading,
    handleSubmit,
    setInput: setChatInput,
  } = useChat({
    api: "/api/chat-test",
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    setChatInput(input)
    setInput("")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Simple Grok Chat Test
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-muted-foreground">Send a message to test the Grok integration</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

