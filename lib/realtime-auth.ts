import { createClient } from "@/lib/supabase/client"

export async function setupRealtimeAuth() {
  const supabase = createClient()

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Set the auth token for Realtime
    await supabase.realtime.setAuth(session.access_token)
    return true
  }

  return false
}

