import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z, ZodError, ZodIssue, ZodFormattedError } from 'zod'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeHtml } from '@/lib/security/sanitize'

// Define the feedback schema for validation with stricter rules
const feedbackSchema = z.object({
  category: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_\-\s]+$/),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(500),
  worthTime: z.boolean().optional().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// Define response types for better type safety
type SuccessResponse = {
  message: string;
  id?: string;
}

type ErrorResponse = {
  error: string;
  details?: ZodFormattedError<unknown, string> | ZodIssue[];
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const config = { 
  runtime: 'edge', 
  cache: 'no-store' 
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    try {
      // Apply rate limiting
      const ip = req.headers.get('x-forwarded-for') || 'anonymous'
      const rateLimitResult = await rateLimit(req, {
        uniqueIdentifier: `feedback_${ip}`,
        limit: 10,
        timeframe: 60, // 10 requests per minute
      })

      if (!rateLimitResult.success) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Rate limit exceeded. Please try again later.' },
          { 
            status: 429,
            headers: rateLimitResult.headers
          }
        )
      }
      
      // Parse the request body
      const body = await req.json();
      
      // Explicit runtime type checks
      if (
        typeof body !== 'object' ||
        typeof body.category !== 'string' ||
        (body.rating !== undefined && typeof body.rating !== 'number') ||
        (body.comment !== undefined && typeof body.comment !== 'string') ||
        (body.worthTime !== undefined && typeof body.worthTime !== 'boolean') ||
        (body.metadata !== undefined && typeof body.metadata !== 'object')
      ) {
        return NextResponse.json<ErrorResponse>({ error: 'Invalid request body' }, { status: 400 });
      }

      const validationResult = feedbackSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: 'Invalid feedback data', 
            details: validationResult.error.format()
          },
          { status: 400 }
        )
      }
      
      const validatedData = feedbackSchema.parse(body)
      
      // Sanitize the comment to prevent XSS
      const sanitizedComment = sanitizeHtml(validatedData.comment)
      
      // Create a Supabase client
      const supabase = createServerClient({ cookies })
      
      // Get the user session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if the user is authenticated
      if (!session) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // Insert the feedback into the database
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: session.user.id,
          category: validatedData.category,
          rating: validatedData.rating,
          comment: sanitizedComment,
          worth_time: validatedData.worthTime,
          metadata: validatedData.metadata || {},
          ip_address: env.IS_PRODUCTION ? ip : null, // Only store IP in production
        })
        .select('id')
        .single()
      
      // Handle database errors
      if (error) {
        console.error('Error inserting feedback:', error)
        return NextResponse.json<ErrorResponse>(
          { error: 'Failed to submit feedback' },
          { status: 500 }
        )
      }
      
      // Return success response with no-cache headers
      const response = NextResponse.json<SuccessResponse>(
        { 
          message: 'Feedback submitted successfully',
          id: data?.id
        },
        { status: 201 }
      )
      
      // Add cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    } catch (error) {
      console.error(JSON.stringify({
        route: '/api/feedback',
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }));
      return NextResponse.json<ErrorResponse>(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing feedback:', error)
    
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid feedback data', details: error.issues },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json<ErrorResponse>(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
