'use client';

import { createUniversalClient } from '@/lib/supabase/universal';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate a CSRF token - this function should only be used in server components
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');

  // This function is not compatible with client components
  // It's kept here for backward compatibility but should be migrated to csrf-server.ts
  console.warn('generateCsrfToken in csrf.ts should only be used in server components');

  return token;
}

// Validate a CSRF token - this function should only be used in server components
export async function validateCsrfToken(token: string): Promise<boolean> {
  // This function is not compatible with client components
  // It's kept here for backward compatibility but should be migrated to csrf-server.ts
  console.warn('validateCsrfToken in csrf.ts should only be used in server components');

  return false;
}

// Get the current user with CSRF protection - client-side version
export async function getCurrentUserWithCsrf() {
  const supabase = createUniversalClient();
  const { data, error } = await supabase.auth.getUser();

  // For client components, we need to fetch the CSRF token from the API
  let csrfToken = '';

  try {
    const response = await fetch('/api/auth/csrf/token');
    const tokenData = await response.json();
    csrfToken = tokenData.token;
  } catch (e) {
    console.error('Failed to fetch CSRF token:', e);
  }

  return {
    user: data?.user || null,
    error,
    csrfToken,
  };
}
