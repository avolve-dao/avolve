"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { handleError, ErrorType } from "@/lib/error-handler"
import { ROUTES } from "@/constants"
import type { User } from "@supabase/supabase-js"

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  error: string | null
}

export interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
  refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Check if user is admin
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

          setState({
            user: session.user,
            isLoading: false,
            isAuthenticated: true,
            isAdmin: profile?.role === "admin",
            error: null,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            error: null,
          })
        }
      } catch (error) {
        handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "initAuth" })
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          error: error instanceof Error ? error.message : "Failed to initialize authentication",
        })
      }
    }

    initAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Check if user is admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        setState({
          user: session.user,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: profile?.role === "admin",
          error: null,
        })
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return true
    } catch (error) {
      handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "signIn" })
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to sign in",
      }))
      return false
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${ROUTES.DASHBOARD}`,
        },
      })

      if (error) throw error

      return true
    } catch (error) {
      handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "signUp" })
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to sign up",
      }))
      return false
    }
  }, [])

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      router.push(ROUTES.HOME)
    } catch (error) {
      handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "signOut" })
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to sign out",
      }))
    }
  }, [router])

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.UPDATE_PASSWORD}`,
      })

      if (error) throw error

      setState((prev) => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "resetPassword" })
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to reset password",
      }))
      return false
    }
  }, [])

  // Update password
  const updatePassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setState((prev) => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "updatePassword" })
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to update password",
      }))
      return false
    }
  }, [])

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const { error } = await supabase.auth.refreshSession()

      if (error) throw error

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Check if user is admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        setState({
          user: session.user,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: profile?.role === "admin",
          error: null,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
        })
      }
    } catch (error) {
      handleError(error, ErrorType.AUTHENTICATION, { component: "useAuth", action: "refreshSession" })
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to refresh session",
      }))
    }
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
  }
}
