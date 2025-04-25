import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(undefined, undefined, { cookies: cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tokenTypeId, amount, stakingRuleId } = await request.json();

    if (!tokenTypeId || !amount || !stakingRuleId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get user's profile to check focus area
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('focus')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      return new NextResponse('Error fetching user profile', { status: 400 });
    }

    // Verify staking rule is valid for user's focus
    const { data: stakingRule, error: ruleError } = await supabase
      .from('token_staking_rules')
      .select('*')
      .eq('id', stakingRuleId)
      .single();

    if (ruleError || !stakingRule) {
      return new NextResponse('Invalid staking rule', { status: 400 });
    }

    if (!stakingRule.focus_areas.includes(profile.focus)) {
      return new NextResponse('Staking rule not available for your focus area', { status: 400 });
    }

    // Perform the staking operation
    const { data: transaction, error: stakeError } = await supabase.rpc(
      'handle_token_transaction',
      {
        p_user_id: session.user.id,
        p_token_type_id: tokenTypeId,
        p_amount: amount,
        p_transaction_type: 'stake',
        p_description: `Staked ${amount} ${tokenTypeId.toUpperCase()} tokens`,
        p_metadata: {
          staking_rule_id: stakingRuleId,
          lock_period_days: stakingRule.lock_period_days,
          apy_percentage: stakingRule.apy_percentage,
        },
      }
    );

    if (stakeError) {
      console.error('Staking error:', stakeError);
      return new NextResponse(stakeError.message, { status: 400 });
    }

    // Create user stake record
    const { error: stakeRecordError } = await supabase.from('user_stakes').insert({
      user_id: session.user.id,
      token_type_id: tokenTypeId,
      staking_rule_id: stakingRuleId,
      amount: amount,
      locked_until: new Date(Date.now() + stakingRule.lock_period_days * 24 * 60 * 60 * 1000),
    });

    if (stakeRecordError) {
      console.error('Error creating stake record:', stakeRecordError);
      return new NextResponse('Error creating stake record', { status: 500 });
    }

    return NextResponse.json({ transactionId: transaction });
  } catch (error) {
    console.error('Error staking tokens:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(undefined, undefined, { cookies: cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's active stakes with related information
    const { data: stakes, error } = await supabase
      .from('user_stakes')
      .select(
        `
        *,
        token_type:token_types(*),
        staking_rule:token_staking_rules(*)
      `
      )
      .eq('user_id', session.user.id)
      .gt('locked_until', new Date().toISOString());

    if (error) {
      console.error('Error fetching stakes:', error);
      return new NextResponse('Error fetching stakes', { status: 500 });
    }

    return NextResponse.json(stakes);
  } catch (error) {
    console.error('Error fetching stakes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
