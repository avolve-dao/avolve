// Server-side only CSRF utility
import { cookies } from "next/headers"
import crypto from "crypto"

// Generate a CSRF token
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  
  // Get cookie store
  const cookieStore: Awaited<ReturnType<typeof cookies>> = await cookies();
  
  // Store the token in a cookie with HttpOnly, Secure, and SameSite flags
  cookieStore.set("csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  })

  return token
}

// Validate a CSRF token
export async function validateCsrfToken(token: string): Promise<boolean> {
  // Get cookie store
  const cookieStore: Awaited<ReturnType<typeof cookies>> = await cookies();
  const storedToken = cookieStore.get("csrf_token")

  if (!storedToken || !token) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(storedToken.value), Buffer.from(token))
}

// Get CSRF token for forms
export async function getCsrfToken() {
  // Generate a new CSRF token for forms
  const csrfToken = await generateCsrfToken()

  return {
    csrfToken,
  }
}
