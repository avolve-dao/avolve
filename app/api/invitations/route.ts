import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/invitations
 *
 * Returns all invitations created by or claimed by the current user.
 * Admin users can see all invitations.
 *
 * @returns {Object} - Object with invitations
 */
export async function GET() {
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

    // Get user's invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Unexpected error in invitations endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations
 *
 * Creates a new invitation.
 *
 * @param {Object} request - Request object with invitation details
 * @returns {Object} - Object with the created invitation
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
    const { email, maxUses, expiresInDays, metadata } = body;

    // Validate input
    if (maxUses && (typeof maxUses !== 'number' || maxUses < 1)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'maxUses must be a positive number' },
        { status: 400 }
      );
    }

    if (expiresInDays && (typeof expiresInDays !== 'number' || expiresInDays < 1)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'expiresInDays must be a positive number' },
        { status: 400 }
      );
    }

    // Create invitation using the database function
    const { data: invitation, error: invitationError } = await supabase.rpc('create_invitation', {
      p_email: email || null,
      p_max_uses: maxUses || 1,
      p_expires_in: expiresInDays ? `${expiresInDays} days` : '7 days',
      p_metadata: metadata || {},
    });

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return NextResponse.json(
        { error: 'Database Error', message: invitationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Unexpected error in invitations endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations/validate
 *
 * Validates an invitation code without claiming it.
 *
 * @param {Object} request - Request object with the invitation code
 * @returns {Object} - Object with the validation result
 */
export async function PATCH(request: NextRequest) {
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

    // Validate invitation code
    const { data: isValid, error: validationError } = await supabase.rpc(
      'validate_invitation_code',
      { p_code: code }
    );

    if (validationError) {
      console.error('Error validating invitation code:', validationError);
      return NextResponse.json(
        { error: 'Database Error', message: validationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Unexpected error in invitations endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
