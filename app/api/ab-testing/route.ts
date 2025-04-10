import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authMiddleware, getUserId } from '@/middleware/auth-middleware';
import { sanitizeJson } from '@/lib/security/sanitize';
import { env } from '@/lib/env';
import { rateLimit } from '@/lib/rate-limit';

// Define the A/B testing schema for validation
const abTestingSchema = z.object({
  testId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_\-]+$/),
  variant: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_\-]+$/),
  action: z.enum(['impression', 'conversion']),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Define response types
type SuccessResponse = {
  success: boolean;
  message: string;
};

type ErrorResponse = {
  error: string;
  details?: any;
};

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST handler for A/B testing events
 * Records impressions and conversions for A/B tests
 */
export async function POST(req: NextRequest) {
  // Check if A/B testing is enabled
  if (!env.AB_TESTING_ENABLED_BOOL) {
    return NextResponse.json<ErrorResponse>(
      { error: 'A/B testing is disabled' },
      { status: 403 }
    );
  }

  try {
    // Apply rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await rateLimit(req, {
      uniqueIdentifier: `ab_testing_${ip}`,
      limit: 50,
      timeframe: 60, // 50 requests per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    // Authenticate the user
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) {
      return authResponse;
    }

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const validationResult = abTestingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Invalid A/B testing data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Sanitize the metadata
    const sanitizedMetadata = validatedData.metadata 
      ? JSON.parse(sanitizeJson(JSON.stringify(validatedData.metadata)))
      : {};
    
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user ID from the request headers
    const userId = getUserId(req);
    
    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }
    
    // Insert the A/B testing event into the database
    const { error } = await supabase
      .from('ab_testing_events')
      .insert({
        user_id: userId,
        test_id: validatedData.testId,
        variant: validatedData.variant,
        action: validatedData.action,
        metadata: sanitizedMetadata,
        // Only store IP in production and with user consent
        ip_address: env.IS_PRODUCTION && sanitizedMetadata.consentToTracking === true 
          ? ip 
          : null,
      });
    
    // Handle database errors
    if (error) {
      console.error('Error inserting A/B testing event:', error);
      return NextResponse.json<ErrorResponse>(
        { error: 'Failed to record A/B testing event' },
        { status: 500 }
      );
    }
    
    // Return success response with no-cache headers
    const response = NextResponse.json<SuccessResponse>(
      { 
        success: true,
        message: 'A/B testing event recorded successfully',
      },
      { status: 201 }
    );
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error processing A/B testing event:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid A/B testing data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json<ErrorResponse>(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for A/B testing configuration
 * Returns the available tests and variants for the user
 */
export async function GET(req: NextRequest) {
  // Check if A/B testing is enabled
  if (!env.AB_TESTING_ENABLED_BOOL) {
    return NextResponse.json<ErrorResponse>(
      { error: 'A/B testing is disabled' },
      { status: 403 }
    );
  }

  try {
    // Authenticate the user
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) {
      return authResponse;
    }

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user ID from the request headers
    const userId = getUserId(req);
    
    if (!userId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }
    
    // Get the user's A/B testing configuration
    const { data, error } = await supabase
      .from('ab_testing_assignments')
      .select('test_id, variant')
      .eq('user_id', userId);
    
    // Handle database errors
    if (error) {
      console.error('Error fetching A/B testing configuration:', error);
      return NextResponse.json<ErrorResponse>(
        { error: 'Failed to fetch A/B testing configuration' },
        { status: 500 }
      );
    }
    
    // Return the A/B testing configuration
    const response = NextResponse.json({
      tests: data || [],
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    
    return response;
  } catch (error) {
    console.error('Error fetching A/B testing configuration:', error);
    
    return NextResponse.json<ErrorResponse>(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
