import { NextRequest, NextResponse } from 'next/server';

/**
 * This is a minimal implementation to satisfy Next.js route requirements
 * The actual functionality has been moved to /app/api/consent/route.ts
 * using query parameters for better compatibility with Next.js 15
 */

export async function GET(request: NextRequest) {
  // Redirect to the main consent API with the ID as a query parameter
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  const redirectUrl = new URL('/api/consent', url.origin);
  redirectUrl.searchParams.set('consent_id', id || '');

  return NextResponse.redirect(redirectUrl);
}

export async function PATCH(request: NextRequest) {
  // Redirect to the main consent API
  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/api/consent', url.origin));
}
