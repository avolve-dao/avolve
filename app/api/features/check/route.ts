import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';

// Define types for request and responses
interface CheckFeatureRequest {
  featureKey: string;
}

/**
 * POST /api/features/check
 *
 * Checks if a user meets the requirements to unlock a feature.
 * This endpoint is used by the frontend to determine if a feature can be unlocked.
 *
 * @param {Request} request - Request with the feature key
 * @returns {Object} - Object with unlock status and requirements
 */
export async function POST(request: Request) {
  try {
    const requestData = (await request.json()) as CheckFeatureRequest;
    const { featureKey } = requestData;

    if (!featureKey) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Feature key is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to check feature requirements' },
        { status: 401 }
      );
    }

    // Check if the feature exists
    const { data: featureExists, error: featureError } = await supabase
      .from('feature_flags')
      .select('key')
      .eq('key', featureKey)
      .single();

    if (featureError && featureError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error checking feature existence:', featureError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to check if feature exists' },
        { status: 500 }
      );
    }

    if (!featureExists) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Feature not found' },
        { status: 404 }
      );
    }

    // Check if the user can unlock the feature
    const { data: checkResult, error: checkError } = await supabase.rpc('check_feature_unlock', {
      p_feature_key: featureKey,
    });

    if (checkError) {
      console.error('Error checking feature unlock requirements:', checkError);
      return NextResponse.json(
        { error: 'Database Error', message: checkError.message },
        { status: 500 }
      );
    }

    // Log the feature check in metrics
    try {
      await supabase.from('metrics').insert({
        user_id: user.id,
        metric_type: 'engagement',
        metric_value: 1,
        details: {
          event: 'feature_check',
          feature: featureKey,
          requirements_met: checkResult.requirements_met,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    return NextResponse.json({
      success: true,
      unlocked: checkResult.unlocked,
      requirementsMet: checkResult.requirements_met,
      message: checkResult.message,
    });
  } catch (error) {
    console.error('Unexpected error in feature check endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
