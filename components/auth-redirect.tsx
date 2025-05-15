"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AuthRedirect() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error checking auth status:", error)
        return
      }

      if (data.session) {
        // User is authenticated, check their profile status
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_agreed_to_terms, has_genius_id, has_gen_tokens, has_genie_ai")
          .eq("id", data.session.user.id)
          .single()

        if (!profile?.has_agreed_to_terms) {
          router.push("/agreement")
        } else if (!profile?.has_genius_id) {
          router.push("/unlock/genius-id")
        } else if (!profile?.has_gen_tokens) {
          router.push("/unlock/gen-token")
        } else if (!profile?.has_genie_ai) {
          router.push("/unlock/genie-ai")
        } else {
          router.push("/dashboard")
        }
      }
    }

    checkAuthAndRedirect()
  }, [router, supabase])

  return null
}
