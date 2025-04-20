import { NextResponse } from 'next/server';
import { TokenService } from '@/lib/token/token-service';
import { createClient } from '@/lib/supabase/client';

// TEMP: Remove context argument to test build error root cause
export async function GET(request: Request) {
  // const { params } = context; // context removed for test
  // const { id } = params;
  // const supabase = createClient();
  // const service = new TokenService(supabase);
  // const result = await service.getCommunityMilestoneById(id);
  // Placeholder: respond with a test message
  return NextResponse.json({ message: 'GET handler reached. Context param removed for build test.' });
}

export async function PATCH(request: Request) {
  // const { params } = context; // context removed for test
  // const { id } = params;
  // const supabase = createClient();
  // const service = new TokenService(supabase);
  // const updates = await request.json();
  // const result = await service.updateCommunityMilestone(id, updates);
  // Placeholder: respond with a test message
  return NextResponse.json({ message: 'PATCH handler reached. Context param removed for build test.' });
}
