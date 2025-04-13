"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { IconBrain } from "@/components/icons"

interface GrokWidgetProps {
  userId: string
  context: string
}

export function GrokWidget({ userId, context }: GrokWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement AI query handling
    console.log("Query:", query, "Context:", context)
    setQuery("")
  }

  return (
    <>
      {/* Floating button */}
      <Button
        size="icon"
        variant="outline"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <IconBrain className="h-6 w-6" />
      </Button>

      {/* Chat widget */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 p-4 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconBrain className="h-5 w-5" />
              <h3 className="font-semibold">Grok AI Assistant</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                →
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  )
}
