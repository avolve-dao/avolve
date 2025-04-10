import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ActivityActionType } from '@/utils/tracking';
import { Logger } from '@/lib/monitoring/logger';

const logger = new Logger('AnonymousTrackingAPI');

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
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
    
    // For anonymous tracking, we'll use a special system user ID or just log without a user ID
    // depending on the database structure
    logger.info('Anonymous action tracked', { actionType, details });
    
    // We'll just log the event without storing it in the database for anonymous users
    // This could be enhanced later to store anonymous events with a session ID
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in anonymous tracking API', error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
