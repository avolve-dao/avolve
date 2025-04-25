import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';

/**
 * POST /api/invitations/bulk
 *
 * Creates multiple invitation codes at once.
 * This endpoint is used by administrators to generate invitation codes in bulk.
 *
 * @param {Object} request - Request object with the invitation details
 * @returns {Object} - Object with the created invitation codes
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

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

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Database Error', message: profileError.message },
        { status: 500 }
      );
    }

    if (profile?.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only administrators can create bulk invitations' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { emails, count, expiresIn, maxUses, metadata } = body;

    if (!emails && !count) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Either emails array or count is required' },
        { status: 400 }
      );
    }

    const results: Array<{
      code: string;
      email?: string;
      error?: string;
    }> = [];

    // Create invitations for specific emails
    if (emails && Array.isArray(emails)) {
      for (const email of emails) {
        try {
          const { data, error } = await supabase.rpc('create_invitation', {
            p_email: email,
            p_max_uses: maxUses || 1,
            p_expires_in: expiresIn || '7 days',
            p_metadata: metadata || {},
          });

          if (error) {
            results.push({ code: '', email, error: error.message });
          } else {
            results.push({ code: data.code, email });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ code: '', email, error: errorMessage });
        }
      }
    }
    // Create a specific number of invitations without emails
    else if (count && typeof count === 'number') {
      for (let i = 0; i < count; i++) {
        try {
          const { data, error } = await supabase.rpc('create_invitation', {
            p_max_uses: maxUses || 1,
            p_expires_in: expiresIn || '7 days',
            p_metadata: metadata || {},
          });

          if (error) {
            results.push({ code: '', error: error.message });
          } else {
            results.push({ code: data.code });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ code: '', error: errorMessage });
        }
      }
    }

    // Log metrics for bulk invitation creation
    try {
      await supabase.from('metrics').insert({
        user_id: user.id,
        metric_type: 'growth',
        metric_value: results.filter(r => r.code).length,
        details: {
          event: 'bulk_invitations_created',
          count: results.length,
          success_count: results.filter(r => r.code).length,
          error_count: results.filter(r => r.error).length,
        },
      });
    } catch (metricError) {
      console.error('Error recording metric:', metricError);
      // Don't fail the request if metric recording fails
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.filter(r => r.code).length} of ${results.length} invitations`,
      results,
    });
  } catch (error) {
    console.error('Unexpected error in bulk invitation endpoint:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
