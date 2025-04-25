import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';

// Define types for request and responses
interface UnlockFeatureRequest {
  featureKey: string;
  force?: boolean;
}

/**
 * POST /api/features/unlock
 *
 * Unlocks a feature for the current user.
 * This endpoint checks if the user meets the requirements to unlock the feature.
 * If force is set to true, the feature will be unlocked regardless of requirements.
 *
 * @param {Request} request - Request with the feature key and optional force flag
 * @returns {Object} - Success status and message
 */
export async function POST(request: Request) {
  try {
    const requestData = (await request.json()) as UnlockFeatureRequest;
    const { featureKey, force = false } = requestData;

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
        { error: 'Unauthorized', message: 'You must be logged in to unlock features' },
        { status: 401 }
      );
    }

    // Check if the user is an admin (admins can force unlock)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Only admins can force unlock features
    if (force && !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only administrators can force unlock features' },
        { status: 403 }
      );
    }

    // Attempt to unlock the feature
    const { data: unlockResult, error: unlockError } = await supabase.rpc('unlock_feature', {
      p_feature_key: featureKey,
      p_force: force,
    });

    if (unlockError) {
      console.error('Error unlocking feature:', unlockError);
      return NextResponse.json(
        { error: 'Database Error', message: unlockError.message },
        { status: 500 }
      );
    }

    if (!unlockResult.success) {
      return NextResponse.json(
        { error: 'Unlock Failed', message: unlockResult.message },
        { status: 400 }
      );
    }

    // Log the feature unlock in metrics
    try {
      await supabase.from('metrics').insert({
        user_id: user.id,
        metric_type: 'activation',
        metric_value: 1,
        details: {
          event: 'feature_unlocked',
          feature: featureKey,
          forced: force,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    // Send a notification about the unlocked feature
    try {
      const response = await fetch('/api/features/unlock-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass the auth cookie along
          Cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({ featureKey }),
      });

      if (!response.ok) {
        console.error('Failed to send unlock notification:', await response.text());
      }
    } catch (notificationError) {
      console.error('Error sending unlock notification:', notificationError);
      // Don't fail the request if notification sending fails
    }

    return NextResponse.json({
      success: true,
      message: unlockResult.message || 'Feature unlocked successfully',
    });
  } catch (error) {
    console.error('Unexpected error in feature unlock endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
