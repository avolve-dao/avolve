import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const service = new TokenService(supabase);
  const result = await service.getAllCommunityMilestones();
  return NextResponse.json({ success: !result.error, data: result.data, error: result.error });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const service = new TokenService(supabase);
  const body = await req.json();
  try {
    const result = await service.createCommunityMilestone(body);
    if (!result || !result.data || !result.data.id) {
      console.error('Milestone creation failed:', result, 'Request body:', body);
      return NextResponse.json({
        success: false,
        data: result?.data,
        error: result?.error || 'Milestone creation failed',
        debug: {
          body,
          result,
          env: {
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
          }
        }
      }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result.data, error: null });
  } catch (error) {
    console.error('Unexpected error in milestone creation:', error, 'Request body:', body);
    return NextResponse.json({ success: false, data: null, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; // Ensure route is always handled dynamically by Next.js
