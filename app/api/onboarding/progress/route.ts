import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data, error } = await (supabase as any)
      .from('user_onboarding')
      .select('completed_steps, completed_at')
      .eq('user_id', user.id)
      .single();
    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch onboarding progress.' },
        { status: 500 }
      );
    }
    const ALL_STEPS = ['profile', 'interests', 'group', 'explore', 'celebrate'];
    const completedSteps = data?.completed_steps || [];
    const onboardingDone = ALL_STEPS.every(s => completedSteps.includes(s));
    return NextResponse.json({ completedSteps, onboardingDone });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
