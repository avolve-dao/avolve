import { updateSession } from '@/lib/supabase/middleware';
import { rateLimit } from '@/lib/rate-limit';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRouteProtection } from '@/middleware/rbac-config';
import { rbacMiddleware } from '@/middleware/rbac-middleware';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// IMPORTANT: Use Database type from supabase-schema to ensure all tables (including user_roles) are available
import { Database } from '@/types/supabase-schema';

// Initialize Supabase client with error handling for URL
let supabase: SupabaseClient<Database> | undefined;
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (supabaseUrl && supabaseKey) {
    supabase = createClient<Database>(supabaseUrl, supabaseKey);
  } else {
    console.error('Supabase URL or Key not set. Client initialization skipped.');
  }
} catch (error: unknown) {
  console.error(
    'Error initializing Supabase client:',
    error instanceof Error ? error.message : 'Unknown error'
  );
}

// Function to create middleware client for session handling
function getMiddlewareSupabaseClient({ req, res }: { req: NextRequest; res: NextResponse }) {
  if (supabase) {
    return supabase;
  } else {
    console.error('Supabase client not initialized, using fallback.');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
      try {
        return createClient<Database>(supabaseUrl, supabaseKey);
      } catch (error: unknown) {
        console.error(
          'Error creating fallback Supabase client:',
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw new Error('Failed to create Supabase client');
      }
    } else {
      throw new Error('Supabase environment variables not set');
    }
  }
}

// Define auth routes that should be rate limited
const AUTH_ROUTES = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/api/auth/'];

// Define API routes that should be rate limited
const API_ROUTES = [
  '/api/features',
  '/api/invitations',
  '/api/onboarding',
  '/api/tokens',
  '/api/user',
];

// Define static asset paths that should be excluded from middleware
const STATIC_ASSET_PATTERNS = [
  /^\/_next\/static\//,
  /^\/_next\/image\//,
  /^\/favicon\.ico$/,
  /\.(svg|png|jpg|jpeg|gif|webp)$/,
  /^\/api\/health$/,
];

// Define onboarding A/B test variants
const AB_TEST_COOKIE = 'avolve-onboarding-variant';
const AB_VARIANTS = ['A', 'B']; // A = streamlined (2-step), B = original (4-step)

// Define security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

// Generate a CSP nonce for each request using Web Crypto API
function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

// Add CSP header with nonce to responses
function addCSPHeader(response: NextResponse, nonce: string) {
  // Enhanced CSP policy for production
  const csp =
    process.env.NODE_ENV === 'development'
      ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.cloudinary.com; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.avolve.io; media-src 'self'; frame-src 'self'; child-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';`
      : `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.avolve.io; style-src 'self' 'unsafe-inline' https://cdn.avolve.io; img-src 'self' data: https://*.cloudinary.com https://cdn.avolve.io; font-src 'self' https://cdn.avolve.io; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.avolve.io; media-src 'self' https://cdn.avolve.io; frame-src 'self'; child-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;`;

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// Cache for rate limiting results to avoid recalculating for the same IP
const rateLimitCache = new Map<string, { result: any; timestamp: number }>();
const RATE_LIMIT_CACHE_TTL = 1000; // 1 second TTL

// Define route patterns
const publicRoutes = ['/', '/unauthorized'];

const authRoutes = [
  '/signin',
  '/signup',
  '/verify',
  '/reset-password',
  '/update-password',
  '/error',
  '/invite',
];

const authenticatedRoutes = [
  '/profile',
  '/welcome',
  '/teams',
  '/teams/create',
  '/teams/[id]',
  '/tokens',
  '/subscription',
];

const superRoutes = [
  '/super/puzzles',
  '/super/puzzles/[id]',
  '/super/puzzles/[id]/contribute',
  '/super/puzzles/today',
  '/super/sacred-geometry',
  '/super/participation',
  '/super/personal',
  '/super/business',
  '/super/mind',
  '/super/puzzle',
  '/super/human',
  '/super/society',
  '/super/genius',
  '/super/civilization',
];

const adminRoutes = ['/admin/security'];

const systemRoutes = ['/api/health', '/protected'];

// Permission check functions
// Use direct query to user_roles and roles since 'has_role' RPC is not available in the generated types
const checkSuperPermission = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'service_role')
      .single();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

const checkAdminRole = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    // Check for 'admin' or 'super' role
    const { data: isAdmin, error: adminError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    if (adminError) return false;
    if (isAdmin) return true;
    const { data: isSuper, error: superError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'service_role')
      .single();
    if (superError) return false;
    return !!isSuper;
  } catch {
    return false;
  }
};

const getOnboardingStatus = async (userId: string) => {
  if (!supabase) return { completed: false };
  // Fallback: Check onboarding status from profiles table (using regeneration_status as a proxy for onboarding)
  const { data, error } = await supabase
    .from('profiles')
    .select('regeneration_status')
    .eq('id', userId)
    .single();

  if (error) return { completed: false };
  // Treat regeneration_status as proxy: if set, onboarding is complete
  return { completed: !!data?.regeneration_status };
};

// Route protection middleware
async function protectRoute(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`Processing request for path: ${pathname}`);
  const isStaticAsset = STATIC_ASSET_PATTERNS.some(pattern => pattern.test(pathname));
  if (isStaticAsset) {
    console.log(`Static asset detected, bypassing protection: ${pathname}`);
    return null;
  }

  // Get session from Supabase
  const res = NextResponse.next();
  let supabaseClient;
  try {
    supabaseClient = getMiddlewareSupabaseClient({ req, res });
    console.log(`Supabase client initialized for path: ${pathname}`);
  } catch (error: unknown) {
    console.error(
      'Error getting Supabase client:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    // Allow public routes even if Supabase client initialization fails
    if (publicRoutes.includes(pathname)) {
      console.log(`Allowing public route despite Supabase error: ${pathname}`);
      return null;
    }
    console.log(`Redirecting to error page due to Supabase error: ${pathname}`);
    return NextResponse.redirect(new URL('/error?message=Service unavailable', req.url));
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  console.log(`Session retrieved for path: ${pathname}, session exists: ${!!session}`);

  // Check public routes
  if (publicRoutes.includes(pathname)) {
    console.log(`Public route allowed: ${pathname}`);
    return null;
  }

  // Check auth routes
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (session) {
      console.log(`Authenticated user accessing auth route, redirecting to dashboard: ${pathname}`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    console.log(`Unauthenticated user accessing auth route, allowing: ${pathname}`);
    return null;
  }

  // Check onboarding status for authenticated routes
  if (authenticatedRoutes.includes(pathname) && pathname !== '/welcome') {
    const onboarding = await getOnboardingStatus(session?.user?.id || '');
    if (!onboarding.completed) {
      console.log(`User not onboarded, redirecting to welcome: ${pathname}`);
      return NextResponse.redirect(new URL('/welcome', req.url));
    }
    console.log(`User onboarded, allowing authenticated route: ${pathname}`);
  }

  // Check super routes
  if (superRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      console.log(`Unauthenticated user accessing super route, redirecting to signin: ${pathname}`);
      return NextResponse.redirect(
        new URL('/signin?redirect=' + encodeURIComponent(pathname), req.url)
      );
    }
    if (supabaseClient) {
      const hasSuperPermission = await checkSuperPermission(session.user.id);
      if (!hasSuperPermission) {
        console.log(`User lacks super permission, redirecting to unauthorized: ${pathname}`);
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      console.log(`User has super permission, allowing: ${pathname}`);
    } else {
      console.error('Supabase client not initialized, cannot check permissions.');
      console.log(`Supabase client not initialized, redirecting to unauthorized: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      console.log(`Unauthenticated user accessing admin route, redirecting to signin: ${pathname}`);
      return NextResponse.redirect(
        new URL('/signin?redirect=' + encodeURIComponent(pathname), req.url)
      );
    }
    if (supabaseClient) {
      const hasAdminRole = await checkAdminRole(session.user.id);
      if (!hasAdminRole) {
        console.log(`User lacks admin role, redirecting to unauthorized: ${pathname}`);
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      console.log(`User has admin role, allowing: ${pathname}`);
    } else {
      console.error('Supabase client not initialized, cannot check roles.');
      console.log(`Supabase client not initialized, redirecting to unauthorized: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Check system routes
  if (systemRoutes.some(route => pathname.startsWith(route))) {
    console.log(`System route accessed, redirecting to unauthorized: ${pathname}`);
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  console.log(`Route allowed by default: ${pathname}`);
  return null;
}

export async function middleware(request: NextRequest) {
  console.log(`Processing request for path: ${request.nextUrl.pathname}`);
  // Check if the request is for a static asset
  const url = request.nextUrl.pathname;
  if (STATIC_ASSET_PATTERNS.some(pattern => pattern.test(url))) {
    console.log(`Static asset detected, bypassing middleware: ${url}`);
    return NextResponse.next();
  }

  // Skip middleware for auth callback routes to prevent interference with the auth flow
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    console.log(`Auth callback route detected, bypassing middleware: ${url}`);
    return NextResponse.next();
  }

  // Handle A/B testing for onboarding flow
  if (url === '/onboarding') {
    console.log(`Onboarding route detected, handling A/B testing: ${url}`);
    // Get or set A/B test variant
    let response = NextResponse.next();
    let variant = request.cookies.get(AB_TEST_COOKIE)?.value;

    // If no variant is set, randomly assign one
    if (!variant || !AB_VARIANTS.includes(variant)) {
      variant = AB_VARIANTS[Math.floor(Math.random() * AB_VARIANTS.length)];
      response.cookies.set(AB_TEST_COOKIE, variant, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // For variant B (original), redirect to the original onboarding flow
    if (variant === 'B') {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding/original';
      response = NextResponse.redirect(url);
    }

    // Add analytics headers to track the variant
    response.headers.set('x-avolve-ab-variant', variant);

    // Update session and add security headers
    response = await updateSession(request);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Generate nonce for CSP
    const nonce = generateNonce();
    return addCSPHeader(response, nonce);
  }

  // Apply route protection
  const protectionResponse = await protectRoute(request);
  if (protectionResponse) {
    console.log(`Route protection applied, returning response: ${request.nextUrl.pathname}`);
    // Generate nonce for CSP
    const nonce = generateNonce();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      protectionResponse.headers.set(key, value);
    });
    return addCSPHeader(protectionResponse, nonce);
  }

  // Apply rate limiting to auth routes and API routes
  if (
    AUTH_ROUTES.some(route => request.nextUrl.pathname.startsWith(route)) ||
    API_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))
  ) {
    console.log(`Rate limiting applied to route: ${request.nextUrl.pathname}`);
    // Get client IP with fallbacks
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'anonymous';

    const cacheKey = `${ip}:${url}`;

    // Check cache first
    const cachedResult = rateLimitCache.get(cacheKey);
    let rateLimitResult;

    if (cachedResult && Date.now() - cachedResult.timestamp < RATE_LIMIT_CACHE_TTL) {
      rateLimitResult = cachedResult.result;
    } else {
      // Apply stricter rate limits for auth routes
      const isAuthRoute = AUTH_ROUTES.some(route => request.nextUrl.pathname.startsWith(route));
      rateLimitResult = await rateLimit(request, {
        // Stricter limits for auth routes to prevent brute force attacks
        limit: isAuthRoute ? 10 : 60,
        timeframe: 60, // 60 seconds
      });

      // Cache the result
      rateLimitCache.set(cacheKey, {
        result: rateLimitResult,
        timestamp: Date.now(),
      });

      // Clean up old cache entries
      setTimeout(() => {
        rateLimitCache.delete(cacheKey);
      }, RATE_LIMIT_CACHE_TTL);
    }

    // If rate limit is exceeded, return the error response
    if (!rateLimitResult.success) {
      console.log(`Rate limit exceeded, returning error response: ${request.nextUrl.pathname}`);
      const response = NextResponse.json(
        {
          error: rateLimitResult.message,
          retryAfter: rateLimitResult.headers.get('Retry-After') || '60',
        },
        { status: 429 }
      );

      // Copy rate limit headers to the response
      for (const [key, value] of rateLimitResult.headers.entries()) {
        response.headers.set(key, value);
      }

      // Add security headers
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Generate nonce for CSP
      const nonce = generateNonce();
      return addCSPHeader(response, nonce);
    }
  }

  // Check for RBAC protection
  const routeProtection = getRouteProtection(url);
  if (routeProtection) {
    console.log(`RBAC protection applied to route: ${request.nextUrl.pathname}`);
    const rbacResponse = await rbacMiddleware(request, routeProtection);

    // If the RBAC middleware returns a response (redirect or error),
    // add security headers and return it
    if (rbacResponse !== NextResponse.next()) {
      console.log(
        `RBAC middleware returned response, adding security headers: ${request.nextUrl.pathname}`
      );
      Object.entries(securityHeaders).forEach(([key, value]) => {
        rbacResponse.headers.set(key, value);
      });

      // Generate nonce for CSP
      const nonce = generateNonce();
      return addCSPHeader(rbacResponse, nonce);
    }
  }

  // Update the session
  const response = await updateSession(request);

  // Add security headers to all responses
  console.log(`Adding security headers to response: ${request.nextUrl.pathname}`);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Generate nonce for CSP
  const nonce = generateNonce();
  return addCSPHeader(response, nonce);
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
};
