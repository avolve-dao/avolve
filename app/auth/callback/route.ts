import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams

  // Enhanced logging for debugging
  console.log("Auth callback URL:", request.url)
  console.log("Auth callback params:", Object.fromEntries(searchParams.entries()))

  // Check for token_hash and type parameters (used by Supabase email confirmation)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  // Check for code parameter (used by some OAuth flows)
  const code = searchParams.get("code")

  // Default redirect destination
  const next = searchParams.get("next") || "/dashboard"

  // Handle direct errors from Supabase
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  if (error || error_description) {
    console.error("Auth error from Supabase:", { error, error_description })
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?error=${encodeURIComponent(error_description || error || "Unknown error")}`,
    )
  }

  const supabase = await createClient()

  // Case 1: Handle token_hash and type (email confirmation)
  if (token_hash && type) {
    try {
      console.log(`Verifying OTP with token_hash and type=${type}`)
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })

      if (otpError) {
        console.error("OTP verification error:", otpError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(otpError.message)}`)
      }

      console.log("Email verified successfully, redirecting to:", next)
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (err) {
      console.error("Error verifying OTP:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(errorMessage)}`)
    }
  }

  // Case 2: Handle code parameter (OAuth or other flows)
  if (code) {
    try {
      console.log("Exchanging code for session...")
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/error?error=${encodeURIComponent(sessionError.message)}`,
        )
      }

      if (data.session) {
        console.log("Session created successfully, redirecting to dashboard")
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (err) {
      console.error("Error in code exchange:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(errorMessage)}`)
    }
  }

  // If we reach here, no valid parameters were found
  console.error("No valid authentication parameters found")
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Missing or invalid authentication parameters`)
}

