/**
 * Security headers for API responses
 * Implements best practices for securing API endpoints
 */

export interface SecurityHeadersOptions {
  contentSecurityPolicy?: boolean;
  strictTransportSecurity?: boolean;
  xFrameOptions?: boolean;
  xContentTypeOptions?: boolean;
  referrerPolicy?: boolean;
  permissionsPolicy?: boolean;
  cacheControl?: boolean;
}

/**
 * Default security header options
 */
const defaultOptions: SecurityHeadersOptions = {
  contentSecurityPolicy: true,
  strictTransportSecurity: true,
  xFrameOptions: true,
  xContentTypeOptions: true,
  referrerPolicy: true,
  permissionsPolicy: true,
  cacheControl: true,
};

/**
 * Applies security headers to a Headers object
 */
export function applySecurityHeaders(
  headers: Headers,
  options: SecurityHeadersOptions = defaultOptions
): Headers {
  // Content Security Policy
  if (options.contentSecurityPolicy) {
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';"
    );
  }

  // HTTP Strict Transport Security
  if (options.strictTransportSecurity) {
    headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // X-Frame-Options
  if (options.xFrameOptions) {
    headers.set('X-Frame-Options', 'DENY');
  }

  // X-Content-Type-Options
  if (options.xContentTypeOptions) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Referrer-Policy
  if (options.referrerPolicy) {
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Permissions-Policy
  if (options.permissionsPolicy) {
    headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
  }

  // Cache-Control
  if (options.cacheControl) {
    headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return headers;
}

/**
 * Creates a new Headers object with security headers applied
 */
export function createSecurityHeaders(
  options: SecurityHeadersOptions = defaultOptions
): Headers {
  return applySecurityHeaders(new Headers(), options);
}

/**
 * Applies security headers to a Response object
 */
export function withSecurityHeaders(
  response: Response,
  options: SecurityHeadersOptions = defaultOptions
): Response {
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers, options);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
