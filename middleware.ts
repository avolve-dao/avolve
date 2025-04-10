import { updateSession } from "@/lib/supabase/middleware"
import { rateLimit } from "@/lib/rate-limit"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getRouteProtection } from "@/middleware/rbac-config"
import { rbacMiddleware } from "@/middleware/rbac-middleware"

// Define auth routes that should be rate limited
const AUTH_ROUTES = ["/auth/login", "/auth/sign-up", "/auth/forgot-password", "/api/auth/"]

// Define static asset paths that should be excluded from middleware
const STATIC_ASSET_PATTERNS = [
  /^\/_next\/static\//,
  /^\/_next\/image\//,
  /^\/favicon\.ico$/,
  /\.(svg|png|jpg|jpeg|gif|webp)$/,
  /^\/api\/health$/,
]

// Define onboarding A/B test variants
const AB_TEST_COOKIE = 'avolve-onboarding-variant'
const AB_VARIANTS = ['A', 'B'] // A = streamlined (2-step), B = original (4-step)

// Define security headers
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://*.supabase.co;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-src 'self';
    object-src 'none';
  `
    .replace(/\s+/g, " ")
    .trim(),
}

// Cache for rate limiting results to avoid recalculating for the same IP
const rateLimitCache = new Map<string, { result: any; timestamp: number }>()
const RATE_LIMIT_CACHE_TTL = 1000 // 1 second TTL

export async function middleware(request: NextRequest) {
  // Check if the request is for a static asset
  const url = request.nextUrl.pathname
  if (STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(url))) {
    return NextResponse.next()
  }

  // Skip middleware for auth callback routes to prevent interference with the auth flow
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next()
  }
  
  // Handle A/B testing for onboarding flow
  if (url === '/onboarding') {
    // Get or set A/B test variant
    let response = NextResponse.next()
    let variant = request.cookies.get(AB_TEST_COOKIE)?.value
    
    // If no variant is set, randomly assign one
    if (!variant || !AB_VARIANTS.includes(variant)) {
      variant = AB_VARIANTS[Math.floor(Math.random() * AB_VARIANTS.length)]
      response.cookies.set(AB_TEST_COOKIE, variant, { 
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/' 
      })
    }
    
    // For variant B (original), redirect to the original onboarding flow
    if (variant === 'B') {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding/original'
      response = NextResponse.redirect(url)
    }
    
    // Add analytics headers to track the variant
    response.headers.set('x-avolve-ab-variant', variant)
    
    // Update session and add security headers
    response = await updateSession(request)
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }

  // Apply rate limiting to auth routes
  if (AUTH_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))) {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const cacheKey = `${ip}:${url}`

    // Check cache first
    const cachedResult = rateLimitCache.get(cacheKey)
    let rateLimitResult

    if (cachedResult && Date.now() - cachedResult.timestamp < RATE_LIMIT_CACHE_TTL) {
      rateLimitResult = cachedResult.result
    } else {
      rateLimitResult = await rateLimit(request)
      // Cache the result
      rateLimitCache.set(cacheKey, {
        result: rateLimitResult,
        timestamp: Date.now(),
      })

      // Clean up old cache entries
      setTimeout(() => {
        rateLimitCache.delete(cacheKey)
      }, RATE_LIMIT_CACHE_TTL)
    }

    // If rate limit is exceeded, return the error response
    if (!rateLimitResult.success) {
      const response = NextResponse.json({ error: rateLimitResult.message }, { status: 429 })

      // Copy rate limit headers to the response
      for (const [key, value] of rateLimitResult.headers.entries()) {
        response.headers.set(key, value)
      }

      // Add security headers
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }
  }

  // Check for RBAC protection
  const routeProtection = getRouteProtection(url)
  if (routeProtection) {
    const rbacResponse = await rbacMiddleware(request, routeProtection)
    
    // If the RBAC middleware returns a response (redirect or error),
    // add security headers and return it
    if (rbacResponse !== NextResponse.next()) {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        rbacResponse.headers.set(key, value)
      })
      return rbacResponse
    }
  }

  // Update the session
  const response = await updateSession(request)

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico).*)',
  ],
}
