import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const service = new TokenService(supabase);
  const { milestoneId, userId, amount } = await req.json();
  const result = await service.contributeToMilestone(milestoneId, userId, amount);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const service = new TokenService(supabase);
  const { searchParams } = new URL(req.url);
  const milestoneId = searchParams.get('milestoneId');
  if (!milestoneId) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'milestoneId is required' } },
      { status: 400 }
    );
  }
  const result = await service.getMilestoneContributions(milestoneId);
  return NextResponse.json(result);
}
