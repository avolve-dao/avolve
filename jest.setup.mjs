/**
 * Jest setup file for Avolve platform
 * Imports test libraries and sets up global test environment
 * Updated: April 2025
 */

// Import jest-dom for additional DOM testing matchers
import '@testing-library/jest-dom';

// Note: TextEncoder/TextDecoder polyfills are now in jest-polyfills.js
// which is loaded before this file via setupFiles in jest.config.mjs

// Note: fetch, Headers, Request, Response are now mocked in jest-polyfills.js

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Only log errors in tests, not warnings or logs
console.error = (...args) => {
  if (args[0]?.includes?.('Warning:')) return;
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('Invalid hook call') ||
    args[0]?.includes?.('React.createFactory()')
  )
    return;
  originalConsoleWarn(...args);
};

console.log = (...args) => {
  // Allow explicit test logs through
  if (args[0]?.includes?.('TEST:')) {
    originalConsoleLog(...args);
  }
};

// Clean up mocks after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;
