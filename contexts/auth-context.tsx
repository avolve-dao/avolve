"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
        setUser(user)
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, user, signOut }}>{children}</AuthContext.Provider>
}
