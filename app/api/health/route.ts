import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
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
    console.error(JSON.stringify({
      route: '/api/health',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Your business logic here
  } catch (error) {
    console.error(JSON.stringify({
      route: '/api/health',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
