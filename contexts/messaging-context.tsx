"use client"

import * as React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { setupRealtimeAuth } from "@/lib/realtime-auth"

interface MessagingContextType {
  isRealtimeAuthenticated: boolean
}

const MessagingContext = createContext<MessagingContextType>({
  isRealtimeAuthenticated: false,
})

export const useMessaging = () => useContext(MessagingContext)

export function MessagingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isRealtimeAuthenticated, setIsRealtimeAuthenticated] = useState(false)

  useEffect(() => {
    const initializeRealtime = async () => {
      const isAuthenticated = await setupRealtimeAuth()
      setIsRealtimeAuthenticated(isAuthenticated)
    }

    initializeRealtime()
  }, [])

  return <MessagingContext.Provider value={{ isRealtimeAuthenticated }}>{children}</MessagingContext.Provider>
}

