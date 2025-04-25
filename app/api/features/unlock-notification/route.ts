import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';
import { sendFeatureUnlockedEmail } from '@/lib/email/emailService';

// Define types for request and responses
interface UnlockNotificationRequest {
  featureKey: string;
}

type Profile = {
  full_name: string | null;
  email_notifications: boolean | null;
};

type FeatureFlag = {
  description: string | null;
};

/**
 * POST /api/features/unlock-notification
 *
 * Sends a notification to the user when they unlock a new feature.
 * This includes an in-app notification and optionally an email.
 *
 * @param {Request} request - Request with the feature key
 * @returns {Object} - Success status and message
 */
export async function POST(request: Request) {
  try {
    const requestData = (await request.json()) as UnlockNotificationRequest;
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
        { error: 'Unauthorized', message: 'You must be logged in to receive notifications' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email_notifications')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Get feature details
    const { data: featureData, error: featureError } = await supabase
      .from('feature_flags')
      .select('description')
      .eq('key', featureKey)
      .single();

    if (featureError) {
      console.error('Error fetching feature details:', featureError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch feature details' },
        { status: 500 }
      );
    }

    // Format feature name for display
    const formatFeatureName = (key: string) => {
      return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    };

    const featureName = formatFeatureName(featureKey);
    const featureDescription = featureData?.description || `You now have access to ${featureName}.`;

    // Log the feature unlock in metrics
    try {
      await supabase.from('metrics').insert({
        user_id: user.id,
        metric_type: 'engagement',
        metric_value: 1,
        details: {
          event: 'feature_unlocked',
          feature: featureKey,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    // Create a notification for the user
    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'feature_unlocked',
        title: 'New Feature Unlocked',
        content: `You've unlocked ${featureName}!`,
        read: false,
        data: {
          feature: featureKey,
          unlocked_at: new Date().toISOString(),
        },
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    // Send email notification if user has email notifications enabled
    if (profile.email_notifications !== false && user.email) {
      try {
        await sendFeatureUnlockedEmail(
          user.email,
          featureName,
          featureDescription,
          profile.full_name || 'Avolve Member'
        );
      } catch (emailError) {
        console.error('Error sending feature unlock email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feature unlock notification sent',
    });
  } catch (error) {
    console.error('Unexpected error in feature unlock notification:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
