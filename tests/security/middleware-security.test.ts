import dotenv from 'dotenv';
import { fetch, Headers, Request, Response } from 'undici';

// Make fetch available globally for tests
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Load environment variables
dotenv.config();

// Base URL for API requests
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

describe('Middleware Security Tests', () => {
  describe('Security Headers', () => {
    let headers: Record<string, string>;

    beforeAll(async () => {
      // Make a request to the home page to check headers
      const response = await fetch(BASE_URL);
      // Convert headers to a plain object
      headers = Object.fromEntries(response.headers.entries());
    });

    it('should set Content-Security-Policy header', () => {
      expect(headers['content-security-policy']).toBeDefined();

      // Check for specific CSP directives
      const csp = headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("img-src 'self'");
      expect(csp).toContain("connect-src 'self'");
    });

    it('should set X-XSS-Protection header', () => {
      expect(headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should set X-Frame-Options header', () => {
      expect(headers['x-frame-options']).toBe('DENY');
    });

    it('should set X-Content-Type-Options header', () => {
      expect(headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set Referrer-Policy header', () => {
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should set Strict-Transport-Security header', () => {
      expect(headers['strict-transport-security']).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should set Permissions-Policy header', () => {
      expect(headers['permissions-policy']).toBeDefined();

      // Check for specific permissions
      const permissionsPolicy = headers['permissions-policy'];
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to authentication endpoints', async () => {
      // Make multiple requests to the login endpoint
      const requests: Promise<any>[] = [];
      const maxRequests = 20; // This should exceed the rate limit

      for (let i = 0; i < maxRequests; i++) {
        requests.push(
          fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
            }),
          }).catch((error: Error) => error)
        );
      }

      const responses = await Promise.all(requests);

      // Check if any responses have rate limiting headers or status codes
      const rateLimitedResponses = responses.filter(
        (response: any) =>
          response.status === 429 ||
          response.headers.get('retry-after') ||
          response.headers.get('x-ratelimit-remaining') === '0'
      );

      // We should have at least one rate-limited response
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should apply rate limiting to API endpoints', async () => {
      // Make multiple requests to a public API endpoint
      const requests: Promise<any>[] = [];
      const maxRequests = 30; // This should exceed the rate limit

      for (let i = 0; i < maxRequests; i++) {
        requests.push(fetch(`${BASE_URL}/api/public-data`).catch((error: Error) => error));
      }

      const responses = await Promise.all(requests);

      // Check if any responses have rate limiting headers or status codes
      const rateLimitedResponses = responses.filter(
        (response: any) =>
          response.status === 429 ||
          response.headers.get('retry-after') ||
          response.headers.get('x-ratelimit-remaining') === '0'
      );

      // We should have at least one rate-limited response
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CSRF Protection', () => {
    it('should reject API requests without CSRF token', async () => {
      try {
        // Make a POST request without a CSRF token
        await fetch(`${BASE_URL}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'This is a test post',
          }),
        });

        // If we get here, the test failed
        fail('Request should have been rejected due to missing CSRF token');
      } catch (error: any) {
        // Expect a 403 Forbidden response for CSRF token validation failure
        expect(error.status).toBe(403);
      }
    });
  });

  describe('Route Protection', () => {
    it('should redirect unauthenticated users from protected routes', async () => {
      // Try to access a protected route without authentication
      const response = await fetch(`${BASE_URL}/dashboard`, {
        redirect: 'manual',
      }).catch((error: Error) => ({ 
        status: 500, 
        headers: { get: () => null },
        error 
      }));

      // Expect a redirect to the login page
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should redirect authenticated users from auth routes', async () => {
      // This test would require browser session handling
      // Skipping for now, but would be implemented with Playwright E2E tests
      console.log('Note: Full testing of authenticated redirects requires browser session handling');
    });

    it('should restrict admin routes to admin users', async () => {
      // Try to access an admin route without admin privileges
      const response = await fetch(`${BASE_URL}/admin/dashboard`, {
        redirect: 'manual',
      }).catch((error: Error) => ({ 
        status: 500, 
        headers: { get: () => null },
        error 
      }));

      // Expect either a redirect to login or a 403 Forbidden
      expect([302, 403]).toContain(response.status);
    });
  });
});
