import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const service = new TokenService(supabase);
  const { id } = params;
  const result = await service.getTeamById(id);
  return NextResponse.json(result);
}
