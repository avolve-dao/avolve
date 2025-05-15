"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type TableName = "profiles" | "messages" | "value_creation" | "user_challenges" | "genie_conversations"
type EventType = "INSERT" | "UPDATE" | "DELETE" | "*"

interface UseRealtimeOptions<T> {
  table: TableName
  event?: EventType
  filter?: string
  schema?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void
  onAll?: (payload: RealtimePostgresChangesPayload<T>) => void
}

/**
 * Hook for subscribing to Supabase realtime changes
 * @param options Configuration options for the realtime subscription
 * @returns Object containing the subscription status
 */
export function useSupabaseRealtime<T = any>(options: UseRealtimeOptions<T>) {
  const { table, event = "*", filter, schema = "public", onInsert, onUpdate, onDelete, onAll } = options

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Clean up any existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    setError(null)

    try {
      // Create channel name with unique identifier
      const channelName = `${table}-changes-${Date.now()}`

      // Set up filter object
      const filterObject = {
        event,
        schema,
        table,
      }

      // Add filter if provided
      if (filter) {
        // @ts-ignore - Adding filter to object
        filterObject.filter = filter
      }

      // Create and subscribe to channel
      channelRef.current = supabase
        .channel(channelName)
        .on("postgres_changes", filterObject, (payload) => {
          // Call the appropriate callback based on the event type
          if (payload.eventType === "INSERT" && onInsert) {
            onInsert(payload as RealtimePostgresChangesPayload<T>)
          } else if (payload.eventType === "UPDATE" && onUpdate) {
            onUpdate(payload as RealtimePostgresChangesPayload<T>)
          } else if (payload.eventType === "DELETE" && onDelete) {
            onDelete(payload as RealtimePostgresChangesPayload<T>)
          }

          // Always call onAll if provided
          if (onAll) {
            onAll(payload as RealtimePostgresChangesPayload<T>)
          }
        })
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED")
          if (status === "CHANNEL_ERROR") {
            setError(new Error("Failed to connect to realtime channel"))
          }
        })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error setting up realtime subscription"))
      console.error("Error setting up realtime subscription:", err)
    }

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, schema, onInsert, onUpdate, onDelete, onAll, supabase])

  return {
    isConnected,
    error,
  }
}
