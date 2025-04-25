import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';

type RequestBody = {
  step: string;
  completed?: boolean;
};

/**
 * PATCH /api/onboarding/update-step
 *
 * Updates the user's onboarding progress for a specific step.
 * This endpoint is used during the onboarding flow to track user progress.
 *
 * @param {Object} request - Request object with the step details
 * @returns {Object} - Object with the updated onboarding progress
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update onboarding progress' },
        { status: 401 }
      );
    }

    // Get request body
    const body = (await request.json()) as RequestBody;
    const { step, completed = true } = body;

    if (!step) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Step name is required' },
        { status: 400 }
      );
    }

    // Update onboarding progress using the database function
    const { data: progress, error: updateError } = await supabase.rpc(
      'update_onboarding_progress',
      {
        p_step: step,
        p_completed: completed,
      }
    );

    if (updateError) {
      console.error('Error updating onboarding progress:', updateError);
      return NextResponse.json(
        { error: 'Database Error', message: updateError.message },
        { status: 500 }
      );
    }

    // Log metrics for the onboarding step
    try {
      await supabase.from('metrics').insert({
        user_id: user.id,
        metric_type: 'activation',
        metric_value: 1,
        details: {
          event: 'onboarding_step_completed',
          step,
          completed,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    // Check if this completes the onboarding process
    if (progress.onboarding_completed) {
      try {
        // Add a notification for completing onboarding
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'onboarding_completed',
          title: 'Onboarding Completed',
          content: 'Congratulations! You have completed the onboarding process.',
          read: false,
          data: {
            completed_at: new Date().toISOString(),
          },
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Unexpected error in update onboarding step endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get onboarding progress
    const { data: progress, error } = await supabase.rpc('get_user_progress');

    if (error) {
      console.error('Error getting onboarding progress:', error);
      return NextResponse.json({ error: 'Failed to get onboarding progress' }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Unexpected error in onboarding progress fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
