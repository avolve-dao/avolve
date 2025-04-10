import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Define the feedback schema for validation
const feedbackSchema = z.object({
  category: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5).max(500),
  worthTime: z.boolean().optional().default(true),
})

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const config = { 
  runtime: 'edge', 
  cache: 'no-store' 
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json()
    
    // Validate the request body
    const validatedData = feedbackSchema.parse(body)
    
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Insert the feedback into the database
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: session.user.id,
        category: validatedData.category,
        rating: validatedData.rating,
        comment: validatedData.comment,
        worth_time: validatedData.worthTime,
      })
    
    // Handle database errors
    if (error) {
      console.error('Error inserting feedback:', error)
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      )
    }
    
    // Return success response with no-cache headers
    const response = NextResponse.json(
      { message: 'Feedback submitted successfully' },
      { status: 201 }
    )
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error processing feedback:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
