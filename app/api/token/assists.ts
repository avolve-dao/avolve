import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const service = new TokenService(supabase);
  const { helperId, recipientId, description } = await req.json();
  const result = await service.logAssist(helperId, recipientId, description);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const service = new TokenService(supabase);
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'userId is required' } }, { status: 400 });
  }
  const result = await service.getAssistsForUser(userId);
  return NextResponse.json(result);
}
