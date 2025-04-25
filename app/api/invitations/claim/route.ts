import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sendFeatureUnlockedEmail } from '@/lib/email/emailService';

// Define types for database responses
type Profile = {
  full_name: string | null;
  email_notifications: boolean | null;
};

type Invitation = {
  created_by: string | null;
  email: string | null;
};

/**
 * POST /api/invitations/claim
 *
 * Claims an invitation code.
 * This endpoint is used during the onboarding process when a user enters an invitation code.
 *
 * @param {Object} request - Request object with the invitation code
 * @returns {Object} - Object with the claim result
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invitation code is required' },
        { status: 400 }
      );
    }

    // Claim invitation code
    const { data: claimed, error: claimError } = await supabase.rpc('claim_invitation' as any, {
      p_code: code,
    });

    if (claimError) {
      console.error('Error claiming invitation code:', claimError);
      return NextResponse.json(
        { error: 'Database Error', message: claimError.message },
        { status: 500 }
      );
    }

    if (!claimed) {
      return NextResponse.json(
        {
          error: 'Invalid Code',
          message: 'The invitation code is invalid or has already been used',
        },
        { status: 400 }
      );
    }

    // Log the successful claim
    console.log(`User ${user.id} successfully claimed invitation code ${code}`);

    // Get user profile for email notification
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email_notifications')
      .eq('id', user.id)
      .single();

    const typedProfile = profile as Profile | null;

    // Add metrics for the invitation claim
    try {
      await supabase.from('metrics').insert({
        user_id: user.id,
        metric_type: 'activation',
        metric_value: 1,
        details: {
          event: 'invitation_claimed',
          code,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    // Send welcome email with initial feature unlock notification
    if (typedProfile?.email_notifications !== false && user.email) {
      try {
        // Send email about the first feature unlock (dashboard access)
        await sendFeatureUnlockedEmail(
          user.email,
          'Dashboard Access',
          'You now have access to the Avolve dashboard, where you can track your progress, connect with others, and explore the platform.',
          typedProfile?.full_name || 'Avolve Member'
        );
      } catch (emailError) {
        console.error('Error sending feature unlock email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    // Get the invitation details to notify the creator
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('created_by, email')
      .eq('code', code)
      .single();

    const typedInvitation = invitation as Invitation | null;

    // Notify the invitation creator if available
    if (typedInvitation?.created_by) {
      try {
        // Add a notification for the invitation creator
        await supabase.from('notifications' as any).insert({
          user_id: typedInvitation.created_by,
          type: 'invitation_claimed',
          title: 'Invitation Claimed',
          content: `Your invitation${typedInvitation.email ? ` for ${typedInvitation.email}` : ''} has been claimed.`,
          read: false,
          data: {
            invitation_code: code,
            claimed_by: user.id,
            claimed_at: new Date().toISOString(),
          },
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation code claimed successfully',
    });
  } catch (error) {
    console.error('Unexpected error in claim invitation endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
