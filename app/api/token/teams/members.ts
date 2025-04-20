import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const { teamId, userId } = await req.json();
  const result = await service.joinTeam(teamId, userId);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  if (!teamId) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'teamId is required' } }, { status: 400 });
  }
  const result = await service.getTeamMembers(teamId);
  return NextResponse.json(result);
}
