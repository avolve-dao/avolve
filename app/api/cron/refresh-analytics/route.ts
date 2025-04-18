import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This endpoint is called by Vercel's cron job to refresh network state analytics
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('Authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create Supabase client with admin privileges
    const supabase = await createClient();
    
    // Call the function to refresh all materialized views
    const { error } = await supabase.rpc('refresh_and_log_network_analytics');
    
    if (error) {
      console.error('Error refreshing network analytics:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Network state analytics refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unexpected error in refresh-analytics endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
