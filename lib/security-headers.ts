/**
 * Security headers for API responses
 * Implements best practices for securing API endpoints
 */

import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

/**
 * Apply security headers to response
 * 
 * @param response - The NextResponse object to add headers to
 * @returns The response with security headers added
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const nonce = nanoid();

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "' 'strict-dynamic'",
    "style-src 'self' 'unsafe-inline'", // Required for Next.js
    "img-src 'self' data: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests",
    "connect-src 'self' https://api.supabase.io"
  ].join('; ');

  const headers = response.headers;

  // Security Headers
  headers.set('Content-Security-Policy', csp);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  // Cache Control
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');

  // HSTS (Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Return modified response
  return response;
}

/**
 * Get CSP nonce for use in inline scripts
 * 
 * @returns A unique nonce value
 */
export function getCspNonce(): string {
  return nanoid();
}
