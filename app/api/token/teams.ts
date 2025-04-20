import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const result = await service.getAllTeams();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const body = await req.json();
  const result = await service.createTeam(body);
  return NextResponse.json(result);
}
