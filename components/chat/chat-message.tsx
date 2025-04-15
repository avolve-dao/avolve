"use client"

import { useGestures } from "@/hooks/use-gestures"
import { useRef, useState } from "react"

interface ChatMessageItemProps {
  message: string
  isOwnMessage: boolean
  showHeader: boolean
}

export function ChatMessageItem({ message, isOwnMessage, showHeader }: ChatMessageItemProps) {
  const messageRef = useRef<HTMLDivElement>(null)
  const [isReplyMode, setIsReplyMode] = useState(false)

  // Set up gesture handlers
  useGestures(messageRef as React.RefObject<HTMLElement>, {
    onSwipeRight: () => {
      // Swipe right to reply
      setIsReplyMode(true)
      // In a real implementation, this would activate a reply UI
    },
    onLongPress: () => {
      // Long press could show a context menu with options
      console.log("Long press on message")
    },
  })

  return (
    <div ref={messageRef} className={`flex mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {/* Rest of the component remains the same */}
      <div className={`rounded-xl px-3 py-2 ${isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
        {showHeader && <div className="text-sm font-bold mb-1">{isOwnMessage ? "You" : "Other User"}</div>}
        <div>{message}</div>
      </div>

      {/* Add a visual indicator for reply mode */}
      {isReplyMode && <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>}
    </div>
  )
}
