/**
 * Environment variable validation and access
 *
 * This module provides type-safe access to environment variables with validation
 * and proper error handling for Vercel deployments.
 */

import { z } from 'zod';

// Define required environment variables
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

// Define optional environment variables with defaults
const optionalEnvVars = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_VERCEL_URL: 'localhost:3000',
  VERCEL_ENV: 'development',
  COOKIE_SECRET: '',
  JWT_SECRET: '',
  NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
  NEXT_PUBLIC_AB_TESTING_ENABLED: 'false',
} as const;

// Create type for environment variables
type RequiredEnvVars = (typeof requiredEnvVars)[number];
type OptionalEnvVars = keyof typeof optionalEnvVars;
type EnvVars = RequiredEnvVars | OptionalEnvVars;

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Redis configuration for rate limiting
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),

  // Environment configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

  // Application configuration
  NEXT_PUBLIC_VERCEL_URL: z.string().url().optional(),

  // Security configuration
  COOKIE_SECRET: z.string().min(32).optional(),
  JWT_SECRET: z.string().min(32).optional(),

  // Analytics configuration
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(['true', 'false']).optional().default('false'),

  // A/B testing configuration
  NEXT_PUBLIC_AB_TESTING_ENABLED: z.enum(['true', 'false']).optional().default('false'),
});

// Validation function
function validateEnv(): void {
  const missing = requiredEnvVars.filter(key => !(key in process.env) || process.env[key] === '');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Get environment variable with type safety
export function getEnv(key: RequiredEnvVars): string;
export function getEnv(key: OptionalEnvVars): string;
export function getEnv(key: EnvVars): string {
  // For required variables
  if (requiredEnvVars.includes(key as RequiredEnvVars)) {
    const value = process.env[key];
    if (!value) {
      // This should never happen if validateEnv() is called during initialization
      console.error(`Missing required environment variable: ${key}`);
      // Return a placeholder for non-sensitive variables in development
      if (process.env.NODE_ENV === 'development') {
        return `MISSING_${key}`;
      }
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  // For optional variables
  return process.env[key] || optionalEnvVars[key as OptionalEnvVars];
}

// Get boolean environment variable
export function getBoolEnv(key: EnvVars, defaultValue = false): boolean {
  const value = getEnv(key as any);
  return value ? value.toLowerCase() === 'true' : defaultValue;
}

// Get number environment variable
export function getNumEnv(key: EnvVars, defaultValue = 0): number {
  const value = getEnv(key as any);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Get URL from environment
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT || 3000}`;
}

// Parse and validate environment variables
function getEnvVariables() {
  // For server-side environments
  if (typeof process !== 'undefined' && process.env) {
    return {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      REDIS_URL: process.env.REDIS_URL,
      REDIS_TOKEN: process.env.REDIS_TOKEN,
      NODE_ENV: process.env.NODE_ENV || 'development',
      VERCEL_ENV: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      BASE_URL:
        process.env.NEXT_PUBLIC_VERCEL_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
      COOKIE_SECRET: process.env.COOKIE_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
      ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED || 'false',
      AB_TESTING_ENABLED: process.env.NEXT_PUBLIC_AB_TESTING_ENABLED || 'false',
    };
  }

  // For client-side environments
  return {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERCEL_ENV: 'development',
    BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
    ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED || 'false',
    AB_TESTING_ENABLED: process.env.NEXT_PUBLIC_AB_TESTING_ENABLED || 'false',
  };
}

// Validated environment variables with derived properties
export const env = {
  ...getEnvVariables(),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Derived properties with explicit return types
  get ANALYTICS_ENABLED_BOOL(): boolean {
    return this.ANALYTICS_ENABLED === 'true';
  },

  get AB_TESTING_ENABLED_BOOL(): boolean {
    return this.AB_TESTING_ENABLED === 'true';
  },
};

// Initialize validation
try {
  validateEnv();
} catch (error) {
  // Log error but don't crash in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Environment validation failed:', error);
  } else {
    throw error;
  }
}
