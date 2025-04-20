import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const { id } = params;
  const result = await service.getCommunityMilestoneById(id);
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const { id } = params;
  const updates = await req.json();
  const result = await service.updateCommunityMilestone(id, updates);
  return NextResponse.json(result);
}
