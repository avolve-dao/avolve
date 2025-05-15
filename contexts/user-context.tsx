"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserContextType {
  user: any | null
  profile: any | null
  tokenBalance: number
  transformationProgress: {
    hasAgreedToTerms: boolean
    hasGeniusId: boolean
    hasGenTokens: boolean
    hasGenieAi: boolean
  }
  isLoading: boolean
  refreshUser: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshTokenBalance: () => Promise<void>
  refreshTransformationProgress: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  tokenBalance: 0,
  transformationProgress: {
    hasAgreedToTerms: false,
    hasGeniusId: false,
    hasGenTokens: false,
    hasGenieAi: false,
  },
  isLoading: true,
  refreshUser: async () => {},
  refreshProfile: async () => {},
  refreshTokenBalance: async () => {},
  refreshTransformationProgress: async () => {},
})

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [transformationProgress, setTransformationProgress] = useState({
    hasAgreedToTerms: false,
    hasGeniusId: false,
    hasGenTokens: false,
    hasGenieAi: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        await refreshUser()
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user)
          await Promise.all([refreshProfile(), refreshTokenBalance(), refreshTransformationProgress()])
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setTokenBalance(0)
        setTransformationProgress({
          hasAgreedToTerms: false,
          hasGeniusId: false,
          hasGenTokens: false,
          hasGenieAi: false,
        })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        await Promise.all([refreshProfile(), refreshTokenBalance(), refreshTransformationProgress()])
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const refreshProfile = async () => {
    try {
      if (!user) return

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(data)
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  const refreshTokenBalance = async () => {
    try {
      if (!user) return

      const { data } = await supabase.from("profiles").select("gen_tokens").eq("id", user.id).single()

      setTokenBalance(data?.gen_tokens || 0)
    } catch (error) {
      console.error("Error refreshing token balance:", error)
    }
  }

  const refreshTransformationProgress = async () => {
    try {
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("has_agreed_to_terms, has_genius_id, has_gen_tokens, has_genie_ai")
        .eq("id", user.id)
        .single()

      if (data) {
        setTransformationProgress({
          hasAgreedToTerms: data.has_agreed_to_terms || false,
          hasGeniusId: data.has_genius_id || false,
          hasGenTokens: data.has_gen_tokens || false,
          hasGenieAi: data.has_genie_ai || false,
        })
      }
    } catch (error) {
      console.error("Error refreshing transformation progress:", error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        tokenBalance,
        transformationProgress,
        isLoading,
        refreshUser,
        refreshProfile,
        refreshTokenBalance,
        refreshTransformationProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
