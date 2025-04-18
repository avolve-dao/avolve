import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invitationCodeSchema } from '@/lib/validators/invitation'
import { rateLimit } from '@/lib/utils/rate-limit'

// Create a rate limiter that allows 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute in milliseconds
  limit: 10,
  uniqueTokenPerInterval: 500, // Max number of users per interval
})

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    
    // Check rate limit
    const { success, remaining } = await limiter.check(ip)
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': remaining.toString(),
            'Retry-After': '60',
          }
        }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const result = invitationCodeSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { code } = result.data
    const supabase = createClient()
    
    // Query the database for the invitation
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('code', code)
      .eq('status', 'pending')
      .single()
    
    if (error) {
      // Log security event for invalid code attempts
      await supabase.from('security_logs').insert({
        user_id: null, // No user associated with this request
        ip_address: ip,
        event_type: 'invitation_check_failed',
        severity: 'info',
        details: { code }
      })
      
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired invitation code' },
        { status: 404 }
      )
    }
    
    // Return success response
    return NextResponse.json({
      valid: true,
      invitation: {
        id: data.id,
        code: data.code,
        expires_at: data.expires_at
      }
    })
  } catch (error) {
    console.error('Error checking invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
