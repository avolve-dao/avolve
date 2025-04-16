import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/onboarding/update-step
// Body: { step: string }
export async function PATCH(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  let step: string;
  try {
    const body = await req.json();
    step = body.step;
  } catch (e) {
    console.error('Invalid JSON body', e);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate step input
  const ALL_STEPS = ['profile', 'first-claim', 'join-group', 'explore', 'celebrate'];
  if (!ALL_STEPS.includes(step)) {
    console.warn('Attempt to update onboarding with invalid step:', step);
    return NextResponse.json({ error: 'Invalid onboarding step' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.warn('Unauthorized onboarding update attempt', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch onboarding row
  const { data: onboarding, error: onboardingError } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (onboardingError && onboardingError.code !== 'PGRST116') {
    console.error('Error fetching onboarding row:', onboardingError);
    return NextResponse.json({ error: onboardingError.message }, { status: 500 });
  }

  let completedSteps = onboarding?.completed_steps || [];
  if (!completedSteps.includes(step)) {
    completedSteps = [...completedSteps, step];
  }

  const onboardingDone = ALL_STEPS.every(s => completedSteps.includes(s));

  // Upsert onboarding progress
  const { error: updateError } = await supabase
    .from('user_onboarding')
    .upsert([
      {
        user_id: user.id,
        completed_steps: completedSteps,
        completed_at: onboardingDone ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }
    ], { onConflict: ['user_id'] });

  if (updateError) {
    console.error('Error updating onboarding progress:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (onboardingDone) {
    console.info('User completed onboarding:', user.id);
  }

  return NextResponse.json({ completedSteps, onboardingDone });
}
