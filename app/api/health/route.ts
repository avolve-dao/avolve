import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Check database connection
    const { error } = await supabase
      .from('user_onboarding')
      .select('count(*)', { count: 'exact' })
      .limit(1)

    if (error) throw error

    // Get system status
    const status = {
      database: {
        connected: true,
        error: null,
      },
      auth: {
        configured: true,
      },
      api: {
        healthy: true,
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(status, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      auth: {
        configured: true,
      },
      api: {
        healthy: false,
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
      },
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  }
}
