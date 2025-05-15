"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

export type UserGoal = "personal-growth" | "professional-advancement" | "community-building" | "value-creation"

export interface UserPreferences {
  primaryGoal: UserGoal
  interests: string[]
  communicationFrequency: "daily" | "weekly" | "monthly"
  theme: "light" | "dark" | "system"
}

const defaultPreferences: UserPreferences = {
  primaryGoal: "value-creation",
  interests: [],
  communicationFrequency: "weekly",
  theme: "system",
}

export function useUserPreferences() {
  const { user } = useUser()
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchPreferences()
    } else {
      setPreferences(defaultPreferences)
      setIsLoading(false)
    }
  }, [user])

  const fetchPreferences = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error)
        throw error
      }

      if (data) {
        setPreferences({
          primaryGoal: data.primary_goal || defaultPreferences.primaryGoal,
          interests: data.interests || defaultPreferences.interests,
          communicationFrequency: data.communication_frequency || defaultPreferences.communicationFrequency,
          theme: data.theme || defaultPreferences.theme,
        })
      }
    } catch (error) {
      console.error("Error in fetchPreferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const updatedPreferences = { ...preferences, ...newPreferences }

      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        primary_goal: updatedPreferences.primaryGoal,
        interests: updatedPreferences.interests,
        communication_frequency: updatedPreferences.communicationFrequency,
        theme: updatedPreferences.theme,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setPreferences(updatedPreferences)
      return { success: true }
    } catch (error) {
      console.error("Error updating preferences:", error)
      return { success: false, error }
    }
  }

  return {
    preferences,
    isLoading,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  }
}
