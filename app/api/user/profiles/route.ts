import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';

/**
 * API route for fetching user profiles
 *
 * This endpoint returns a list of all user profiles with basic information
 * for use in UI components like user selectors and recognition forms.
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the current user to ensure they're authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch all user profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Log this activity for analytics
    await supabase.from('metrics').insert([
      {
        event: 'profiles_viewed',
        user_id: user.id,
        timestamp: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ profiles: data || [] });
  } catch (error) {
    console.error('Error in profiles API:', error);

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
