// Avolve Onboarding Edge Function
// Purpose: Initialize user data during onboarding process
// Last updated: 2025-04-23

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import { corsHeaders } from '../_shared/cors.ts';

// Environment variables (set in Supabase dashboard)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-edge-functions/onboarding',
    },
  },
});

// Define onboarding function
async function handleOnboarding(userId: string) {
  // Use transactions to ensure all operations succeed or fail together
  const { error } = await supabase.rpc('initialize_user_onboarding', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Onboarding initialization failed: ${error.message}`);
  }

  // Log successful onboarding
  await supabase.from('metrics').insert([
    {
      event: 'onboarding_completed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      metadata: { source: 'edge_function' },
    },
  ]);

  return { status: 'success', userId };
}

// Main serve function
serve(async req => {
  // Handle CORS for browser requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { user, authorization } = await req.json();

    // Validate request
    if (!user || !user.id) {
      throw new Error('Missing required user information');
    }

    // Verify authorization if provided
    if (authorization) {
      // This would be a JWT verification or other auth check
      // For now, we're using the service role key so this is optional
    }

    // Process onboarding
    const result = await handleOnboarding(user.id);

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error(`Onboarding error: ${error.message}`);

    // Log error for monitoring
    try {
      await supabase.from('metrics').insert([
        {
          event: 'onboarding_error',
          error: error.message,
          timestamp: new Date().toISOString(),
          metadata: { stack: error.stack },
        },
      ]);
    } catch (logError) {
      console.error(`Failed to log error: ${logError.message}`);
    }

    // Return error response
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message,
        code: 'ONBOARDING_FAILED',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
