import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * Enhanced middleware for Supabase authentication
 * Provides session management, CSRF protection, and route protection
 */
export async function updateSession(request: NextRequest) {
  // Initialize response
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user if session exists
  const {
    data: { user },
  } = session ? await supabase.auth.getUser() : { data: { user: null } }

  // Define route types
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/protected") ||
    request.nextUrl.pathname.startsWith("/inbox") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/profile")

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname.startsWith("/auth/forgot-password")

  const isAuthUtilityRoute =
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/auth/error") ||
    request.nextUrl.pathname.startsWith("/auth/debug") ||
    request.nextUrl.pathname.startsWith("/auth/reset-password")

  // Always allow access to auth utility routes
  if (isAuthUtilityRoute) {
    return supabaseResponse
  }

  // If user is not authenticated and trying to access a protected route
  if (!user && isProtectedRoute) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access an auth route
  if (user && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin access for admin routes
  if (isAdminRoute && user) {
    // Get user metadata to check admin status
    const isAdmin = user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true
    
    if (!isAdmin) {
      // Redirect non-admin users to unauthorized page
      const redirectUrl = new URL("/unauthorized", request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // For POST requests to sensitive routes, verify CSRF token
  if (request.method === "POST" && isProtectedRoute) {
    const csrfToken = request.headers.get("x-csrf-token")
    const storedCsrfToken = request.cookies.get("csrf_token")?.value
    
    // If CSRF validation fails, return 403 Forbidden
    if (!csrfToken || !storedCsrfToken || csrfToken !== storedCsrfToken) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      )
    }
  }

  // For all requests to protected routes, refresh the CSRF token
  if (user && isProtectedRoute) {
    const newCsrfToken = crypto.randomUUID()
    supabaseResponse.cookies.set("csrf_token", newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    })
  }

  return supabaseResponse
}
