import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/wallet",
  "/genie-ai",
  "/messages",
  "/chat",
  "/protected",
  "/unlock",
]

// Admin routes that require admin privileges
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  try {
    // Create a response to modify
    const response = NextResponse.next()

    // Create a Supabase client
    const supabase = createMiddlewareClient({
      req: request,
      res: response,
    })

    // Get the pathname
    const { pathname } = request.nextUrl

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    try {
      // Get the session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If the route is protected and the user is not authenticated, redirect to login
      if (isProtectedRoute && !session) {
        const redirectUrl = new URL("/auth/login", request.url)
        redirectUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // If the route is admin-only, check if the user is an admin
      if (isAdminRoute && session) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (!profile || profile.role !== "admin") {
          // Redirect non-admin users to dashboard
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }

      // If the user is authenticated and trying to access auth routes, redirect to dashboard
      if (pathname.startsWith("/auth") && session && pathname !== "/auth/logout") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (authError) {
      console.error("Auth error in middleware:", authError)
      // Continue without redirecting on auth errors
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // Return the original response to avoid breaking the application
    return NextResponse.next()
  }
}

// Define which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/public).*)",
  ],
}
