"use client"

import * as React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useMessagingTheme } from "@/contexts/theme-context"

// List of emojis for the picker
const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👏", "🚀", "✨", "🌈", "🦄"]

interface EmojiReactionsProps {
  itemId: string
  itemType: "message" | "post"
  userId: string
  username: string
}

export function EmojiReactions({ itemId, itemType, userId, username }: EmojiReactionsProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [animatingEmojis, setAnimatingEmojis] = useState<any[]>([])
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const [showPicker, setShowPicker] = useState(false)

  const channelRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { isDark } = useMessagingTheme()

  // Set up Supabase channel
  useEffect(() => {
    // Create a unique channel name for this item
    const channelName = `${itemType}-reactions-${itemId}`

    // Subscribe to channel
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
        broadcast: {
          self: true,
        },
      },
    })

    channelRef.current = channel

    // Handle presence for user list
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState()
      const users: any[] = []

      // Convert presence state to array
      Object.keys(state).forEach((key) => {
        const presences = state[key]
        users.push(...presences)
      })

      setActiveUsers(users)
    })

    // Handle emoji click events
    channel.on("broadcast", { event: "emoji_click" }, (payload) => {
      const { emoji, position, senderId, senderName } = payload.payload

      // Update reactions count
      setReactions((prev) => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1,
      }))

      // Create a new animating emoji
      createAnimatingEmoji(emoji, position)

      // Store user's reactions
      if (senderId === userId) {
        setUserReactions((prev) => ({
          ...prev,
          [emoji]: true,
        }))
      }
    })

    // Handle emoji remove events
    channel.on("broadcast", { event: "emoji_remove" }, (payload) => {
      const { emoji, senderId } = payload.payload

      // Update reactions count
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) - 1),
      }))

      // Update user's reactions
      if (senderId === userId) {
        setUserReactions((prev) => ({
          ...prev,
          [emoji]: false,
        }))
      }
    })

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Track presence
        await channel.track({
          userId: userId,
          username: username,
          online_at: new Date().getTime(),
        })

        setIsConnected(true)

        // Load existing reactions from database
        loadExistingReactions()
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [itemId, itemType, userId, username])

  // Clean up finished animations
  useEffect(() => {
    if (animatingEmojis.length > 0) {
      const timer = setTimeout(() => {
        setAnimatingEmojis((emojis) => emojis.filter((e) => Date.now() - e.timestamp < 2000))
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [animatingEmojis])

  // Load existing reactions from database
  const loadExistingReactions = async () => {
    try {
      // Get reactions for this item
      const { data, error } = await supabase
        .from("reactions")
        .select("emoji, user_id")
        .eq("item_id", itemId)
        .eq("item_type", itemType)

      if (error) throw error

      // Count reactions by emoji
      const counts: Record<string, number> = {}
      const userReacted: Record<string, boolean> = {}

      data?.forEach((reaction) => {
        counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1

        if (reaction.user_id === userId) {
          userReacted[reaction.emoji] = true
        }
      })

      setReactions(counts)
      setUserReactions(userReacted)
    } catch (error) {
      console.error("Error loading reactions:", error)
    }
  }

  // Handle emoji click
  const handleEmojiClick = async (emoji: string, event: React.MouseEvent) => {
    if (!isConnected) return

    // Check if user already reacted with this emoji
    const alreadyReacted = userReactions[emoji]

    if (alreadyReacted) {
      // Remove reaction from database
      try {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("item_id", itemId)
          .eq("item_type", itemType)
          .eq("user_id", userId)
          .eq("emoji", emoji)

        if (error) throw error
      } catch (error) {
        console.error("Error removing reaction:", error)
      }

      // Broadcast the emoji removal
      channelRef.current.send({
        type: "broadcast",
        event: "emoji_remove",
        payload: {
          emoji,
          senderId: userId,
        },
      })

      return
    }

    // Get the position of the clicked emoji relative to the container
    const rect = event.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }

    const position = {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top,
    }

    // Create a new animating emoji locally
    createAnimatingEmoji(emoji, position)

    // Save reaction to database
    try {
      const { error } = await supabase.from("reactions").insert({
        item_id: itemId,
        item_type: itemType,
        user_id: userId,
        emoji: emoji,
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error saving reaction:", error)
    }

    // Broadcast the emoji click to other clients
    channelRef.current.send({
      type: "broadcast",
      event: "emoji_click",
      payload: {
        emoji,
        position,
        senderId: userId,
        senderName: username,
      },
    })
  }

  // Create a new animating emoji
  const createAnimatingEmoji = (emoji: string, position: { x: number; y: number }) => {
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      position,
      timestamp: Date.now(),
    }

    setAnimatingEmojis((emojis) => [...emojis, newEmoji])
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Animating emojis */}
      {animatingEmojis.map((emojiObj) => (
        <div
          key={emojiObj.id}
          className="absolute text-2xl pointer-events-none animate-float-up"
          style={{
            left: `${emojiObj.position.x}px`,
            top: `${emojiObj.position.y}px`,
            transform: "translate(-50%, -50%)",
            animation: "float-up 2s ease-out forwards",
          }}
        >
          {emojiObj.emoji}
        </div>
      ))}

      {/* Reaction counts */}
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactions)
          .filter(([_, count]) => count > 0)
          .map(([emoji, count]) => (
            <button
              key={emoji}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                userReactions[emoji]
                  ? "bg-primary/20 text-primary"
                  : isDark
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-zinc-200 hover:bg-zinc-300",
              )}
              onClick={(e) => handleEmojiClick(emoji, e)}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          ))}

        <button
          className={cn(
            "flex items-center px-2 py-1 rounded-full text-xs",
            isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-200 hover:bg-zinc-300",
          )}
          onClick={() => setShowPicker(!showPicker)}
        >
          +
        </button>
      </div>

      {/* Emoji picker */}
      {showPicker && (
        <div
          className={cn(
            "absolute bottom-full mb-2 p-2 rounded-lg z-10 flex flex-wrap gap-1 max-w-[250px]",
            isDark ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-zinc-200 shadow-md",
          )}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className={cn(
                "text-xl p-1.5 rounded-md hover:bg-accent transition-colors",
                userReactions[emoji] && "bg-primary/20 text-primary",
              )}
              onClick={(e) => {
                handleEmojiClick(emoji, e)
                setShowPicker(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

