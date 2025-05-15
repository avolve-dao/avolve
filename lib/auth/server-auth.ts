import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Gets the current session from the server
 * @returns The current session or null if not authenticated
 */
export async function getServerSession() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Checks if the user is authenticated on the server
 * Redirects to login if not authenticated
 * @param redirectTo The path to redirect to if not authenticated
 * @returns The current session
 */
export async function requireAuth(redirectTo = "/auth/login") {
  const session = await getServerSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}

/**
 * Checks if the user is an admin on the server
 * Redirects to dashboard if not an admin
 * @returns The current session
 */
export async function requireAdmin() {
  const session = await requireAuth()
  const supabase = createClient()

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return session
}
