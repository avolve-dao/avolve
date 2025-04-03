import { createClient } from "@/lib/supabase/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/"

  // Log the parameters to help with debugging
  console.log("Confirm route params:", { token_hash, type, next })

  if (!token_hash || !type) {
    // Check if we have a code parameter instead (for email confirmation)
    const code = searchParams.get("code")
    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return redirect(next)
      } else {
        return redirect(`/auth/error?error=${error.message}`)
      }
    }

    return redirect(`/auth/error?error=No token hash or type`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (!error) {
    return redirect(next)
  } else {
    return redirect(`/auth/error?error=${error.message}`)
  }
}

