import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';

type RequestBody = {
  email: string;
  name: string;
  reason: string;
};

/**
 * POST /api/invitations/request
 *
 * Submits a request for an invitation.
 * This endpoint is used by potential users to request access to the platform.
 *
 * @param {Object} request - Request object with the requester's details
 * @returns {Object} - Object with the request result
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get request body
    const body = (await request.json()) as RequestBody;
    const { email, name, reason } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already has a pending request
    const { data: existingRequests, error: checkError } = await supabase
      .from('invitation_requests')
      .select('id, status')
      .eq('email', email);

    if (checkError) {
      console.error('Error checking existing requests:', checkError);
      return NextResponse.json(
        { error: 'Database Error', message: checkError.message },
        { status: 500 }
      );
    }

    const pendingRequest = existingRequests?.find(r => r.status === 'pending');
    if (pendingRequest) {
      return NextResponse.json(
        { error: 'Duplicate Request', message: 'You already have a pending invitation request' },
        { status: 409 }
      );
    }

    // Create the invitation request
    const { data: requestData, error: insertError } = await supabase
      .from('invitation_requests')
      .insert({
        email,
        name,
        reason: reason || '',
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating invitation request:', insertError);
      return NextResponse.json(
        { error: 'Database Error', message: insertError.message },
        { status: 500 }
      );
    }

    // Log metrics for the invitation request
    try {
      await supabase.from('metrics').insert({
        user_id: null,
        metric_type: 'growth',
        metric_value: 1,
        details: {
          event: 'invitation_requested',
          email,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    // Notify admins about the new request
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_role', 'admin');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'invitation_request',
          title: 'New Invitation Request',
          content: `${name} (${email}) has requested an invitation.`,
          read: false,
          data: {
            request_id: requestData.id,
            email,
            name,
          },
        }));

        await supabase.from('notifications').insert(notifications);
      }
    } catch (notifyError) {
      console.error('Error notifying admins:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation request submitted successfully',
      requestId: requestData.id,
    });
  } catch (error) {
    console.error('Unexpected error in invitation request endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
