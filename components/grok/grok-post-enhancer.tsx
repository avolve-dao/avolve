"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bot, Sparkles, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { logActivity } from "@/lib/activity-logger"

interface GrokPostEnhancerProps {
  userId: string
  originalContent: string
  onSelectEnhancement: (content: string) => void
}

export function GrokPostEnhancer({ userId, originalContent, onSelectEnhancement }: GrokPostEnhancerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [enhancements, setEnhancements] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Record<number, "like" | "dislike" | null>>({})
  const [loadingEnhancementIndex, setLoadingEnhancementIndex] = useState<number | null>(null)

  const enhancementTypes = [
    "Make it more engaging with questions that encourage responses",
    "Add relevant hashtags and make it more discoverable",
    "Refine the tone to be more authentic and conversational",
  ]

  const generateEnhancements = async () => {
    if (isGenerating || !originalContent.trim()) return

    setIsGenerating(true)
    setEnhancements([])
    setSelectedIndex(null)
    setFeedback({})

    try {
      const response = await fetch("/api/grok/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: originalContent,
          userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEnhancements(data.enhancements)

        // Log activity
        logActivity({
          userId,
          action: "post_create",
          entityType: "post",
          entityId: "enhancement",
          metadata: {
            type: "grok_enhancement",
            content: originalContent.substring(0, 100),
          },
        })
      }
    } catch (error) {
      console.error("Error generating enhancements:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    onSelectEnhancement(enhancements[index])
  }

  const handleFeedback = (index: number, type: "like" | "dislike") => {
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === type ? null : type,
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="font-medium">Grok Post Enhancement</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={generateEnhancements}
          disabled={isGenerating || !originalContent.trim()}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              Enhance with Grok
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {enhancements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {enhancements.map((enhancement, index) => (
              <Card
                key={index}
                className={cn(
                  "p-3 cursor-pointer transition-all border-2",
                  selectedIndex === index
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-primary/30",
                )}
                onClick={() => handleSelect(index)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">
                      {index === 0 ? "Engaging" : index === 1 ? "Discoverable" : "Authentic"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{enhancement}</div>

                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(index)
                        }}
                      >
                        Use This
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

