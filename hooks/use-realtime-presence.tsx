"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

interface User {
  id: string
  name: string
  avatarUrl?: string
  status: "online" | "away" | "offline"
  lastSeen: string
}

export function useRealtimePresence(roomName: string) {
  const supabase = createClient()
  const { user } = useUser()
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchInitialPresence = async () => {
      setIsLoading(true)
      try {
        // Get current presence data
        const { data, error } = await supabase
          .from("presence")
          .select("*, profiles(full_name, avatar_url)")
          .eq("room", roomName)
          .order("last_seen_at", { ascending: false })

        if (error) {
          console.error("Error fetching presence:", error)
          return
        }

        if (data) {
          const users: User[] = data.map((presence) => ({
            id: presence.user_id,
            name: presence.profiles?.full_name || "Unknown",
            avatarUrl: presence.profiles?.avatar_url,
            status: presence.status as "online" | "away" | "offline",
            lastSeen: presence.last_seen_at,
          }))

          setOnlineUsers(users)
        }
      } catch (error) {
        console.error("Error fetching presence:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Update our presence
    const updatePresence = async () => {
      try {
        // Check if we already have a presence record
        const { data, error } = await supabase
          .from("presence")
          .select("id")
          .eq("user_id", user.id)
          .eq("room", roomName)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" - that's expected if we don't have a record yet
          console.error("Error checking presence:", error)
        }

        if (data) {
          // Update existing record
          await supabase
            .from("presence")
            .update({
              status: "online",
              last_seen_at: new Date().toISOString(),
            })
            .eq("id", data.id)
        } else {
          // Insert new record
          await supabase.from("presence").insert({
            user_id: user.id,
            room: roomName,
            status: "online",
            last_seen_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Error updating presence:", error)
      }
    }

    fetchInitialPresence()
    updatePresence()

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(updatePresence, 30000) // Every 30 seconds

    // Set up realtime subscription
    const presenceChannel = supabase
      .channel(`presence-${roomName}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "presence",
          filter: `room=eq.${roomName}`,
        },
        async (payload) => {
          // Fetch the updated presence data
          const { data, error } = await supabase
            .from("presence")
            .select("*, profiles(full_name, avatar_url)")
            .eq("room", roomName)
            .order("last_seen_at", { ascending: false })

          if (error) {
            console.error("Error fetching updated presence:", error)
            return
          }

          if (data) {
            const users: User[] = data.map((presence) => ({
              id: presence.user_id,
              name: presence.profiles?.full_name || "Unknown",
              avatarUrl: presence.profiles?.avatar_url,
              status: presence.status as "online" | "away" | "offline",
              lastSeen: presence.last_seen_at,
            }))

            setOnlineUsers(users)
          }
        },
      )
      .subscribe()

    // Set status to offline when leaving
    const handleBeforeUnload = async () => {
      try {
        await supabase
          .from("presence")
          .update({
            status: "offline",
            last_seen_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("room", roomName)
      } catch (error) {
        console.error("Error updating presence on unload:", error)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      supabase.removeChannel(presenceChannel)

      // Set status to offline when component unmounts
      supabase
        .from("presence")
        .update({
          status: "offline",
          last_seen_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("room", roomName)
        .then()
        .catch((error) => {
          console.error("Error updating presence on unmount:", error)
        })
    }
  }, [roomName, user, supabase])

  return { onlineUsers, isLoading }
}
