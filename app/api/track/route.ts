import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ActivityActionType } from '@/utils/tracking';
import { Logger } from '@/lib/monitoring/logger';

const logger = new Logger('TrackingAPI');

// Optimize for edge runtime
export const runtime = 'edge';

// Add caching configuration
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient({ cookies });
    
    // Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate the request body
    if (!body.action_type) {
      return NextResponse.json({ error: 'action_type is required' }, { status: 400 });
    }
    
    // Extract data from the request
    const actionType = body.action_type as ActivityActionType;
    const details = body.details || null;
    const ipAddress = request.headers.get('x-forwarded-for') || null;
    const userAgent = request.headers.get('user-agent') || null;
    
    // Use the queue_activity_log function for asynchronous processing
    const { data, error } = await supabase.rpc('queue_activity_log', {
      p_user_id: userId,
      p_action_type: actionType,
      p_details: details,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_immersion_level: body.immersion_level || 1
    });
    
    if (error) {
      logger.error('Error logging user activity', error, { userId, actionType });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, activity_id: data });
  } catch (error) {
    console.error(JSON.stringify({
      route: '/api/track',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
