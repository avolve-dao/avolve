import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * API route for admin user management
 *
 * This endpoint provides admin functionality for managing users:
 * - GET: List all users with their profiles and stats
 * - POST: Update user details or permissions
 * - DELETE: Deactivate a user account
 *
 * All operations require admin privileges.
 */

// Helper function to check if the current user is an admin
async function isAdmin(supabase: any) {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    // Check if the user is an admin
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is an admin
    const adminCheck = await isAdmin(supabase);

    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    // Get all users with their profiles
    const { data: users, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        user_email,
        full_name,
        avatar_url,
        bio,
        is_admin,
        created_at,
        updated_at,
        regeneration_status
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Log this admin activity
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('metrics').insert({
        event: 'admin_users_viewed',
        user_id: user.id,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Error in admin users API:', error);

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST /api/admin/users - Update user details
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is an admin
    const adminCheck = await isAdmin(supabase);

    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    // Get the user data from the request body
    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400 });
    }

    // Update the user profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Log this admin activity
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('metrics').insert({
        event: 'admin_user_updated',
        user_id: user.id,
        timestamp: new Date().toISOString(),
        metadata: { target_user_id: userId, updates: JSON.stringify(updates) },
      });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in admin users API:', error);

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Deactivate a user
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is an admin
    const adminCheck = await isAdmin(supabase);

    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    // Get the URL to extract the user ID
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Instead of actually deleting the user, we'll update their status
    // This is a soft delete approach
    const { data, error } = await supabase
      .from('profiles')
      .update({ regeneration_status: 'deactivated' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error deactivating user:', error);
      return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
    }

    // Log this admin activity
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('metrics').insert({
        event: 'admin_user_deactivated',
        user_id: user.id,
        timestamp: new Date().toISOString(),
        metadata: { target_user_id: userId },
      });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error in admin users API:', error);

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
