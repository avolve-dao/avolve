"use client"

import { useCurrentUserImage } from "@/hooks/use-current-user-image"
import { useCurrentUserName } from "@/hooks/use-current-user-name"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef, useCallback } from "react"

const supabase = createClient()

export type RealtimeUser = {
  id: string
  name: string
  image: string
  lastUpdated?: number
}

export const useRealtimePresenceRoom = (roomName: string) => {
  const currentUserImage = useCurrentUserImage()
  const currentUserName = useCurrentUserName()
  const [users, setUsers] = useState<Record<string, RealtimeUser>>({})
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastTrackTimestampRef = useRef<number>(0)
  const trackThrottleMs = 5000 // Only update presence every 5 seconds

  // Memoize the track function to prevent unnecessary re-renders
  const trackPresence = useCallback(async () => {
    if (!channelRef.current) return

    const now = Date.now()
    if (now - lastTrackTimestampRef.current < trackThrottleMs) {
      return // Skip tracking if we've updated recently
    }

    lastTrackTimestampRef.current = now

    await channelRef.current.track({
      name: currentUserName,
      image: currentUserImage,
      lastUpdated: now,
    })
  }, [currentUserName, currentUserImage])

  useEffect(() => {
    const userId = supabase.auth.getUser().then(({ data }) => data.user?.id || "anonymous")

    const channel = supabase.channel(roomName, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channelRef.current = channel

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<{ image: string; name: string; lastUpdated?: number }>()

        // Only update state if there are actual changes
        const newUsers = Object.fromEntries(
          Object.entries(newState).map(([key, values]) => [
            key,
            {
              id: key,
              name: values[0].name,
              image: values[0].image,
              lastUpdated: values[0].lastUpdated,
            },
          ]),
        ) as Record<string, RealtimeUser>

        setUsers((prevUsers) => {
          // Check if the users have actually changed before updating state
          const hasChanged =
            Object.keys(newUsers).length !== Object.keys(prevUsers).length ||
            Object.keys(newUsers).some((key) => {
              return (
                !prevUsers[key] ||
                prevUsers[key].name !== newUsers[key].name ||
                prevUsers[key].image !== newUsers[key].image
              )
            })

          return hasChanged ? newUsers : prevUsers
        })
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return
        }

        await trackPresence()
      })

    // Set up periodic tracking to maintain presence
    const trackInterval = setInterval(trackPresence, 30000) // Every 30 seconds

    return () => {
      clearInterval(trackInterval)
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [roomName, trackPresence])

  return { users }
}
