import { AuthService } from "@/lib/auth/auth-service"
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

  // Get server-side instance of auth service
  const authService = AuthService.getServerInstance()
  const supabase = authService.getSupabaseClient()

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

      // Determine the appropriate confirmation page based on the type
      let confirmationRedirect = `${requestUrl.origin}/auth/confirmation?type=success`
      
      // For specific types, show specific confirmation pages
      if (type === 'signup') {
        confirmationRedirect = `${requestUrl.origin}/auth/confirmation?type=success&action=signup`
      } else if (type === 'recovery') {
        confirmationRedirect = `${requestUrl.origin}/auth/confirmation?type=success&action=reset`
      } else if (type === 'email_change') {
        confirmationRedirect = `${requestUrl.origin}/auth/confirmation?type=success&action=email`
      }
      
      console.log("Email verified successfully, redirecting to:", confirmationRedirect)
      return NextResponse.redirect(confirmationRedirect)
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
        // Check if there's a specific redirect URL in the session metadata
        const redirectTo = data.session.user?.user_metadata?.redirect_to || '/dashboard'
        
        console.log("Session created successfully, redirecting to:", redirectTo)
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
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
