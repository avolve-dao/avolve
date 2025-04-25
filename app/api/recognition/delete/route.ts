import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';

/**
 * API route for deleting a recognition
 *
 * This endpoint allows users to delete their own recognitions.
 * It includes proper error handling and authentication checks.
 */
export async function POST(request: Request) {
  try {
    // Get the recognition ID from the request body
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Recognition ID is required' }, { status: 400 });
    }

    // Initialize Supabase client with cookies for auth
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the user is the sender of the recognition
    const { data: recognition, error: fetchError } = await supabase
      .from('peer_recognition')
      .select('sender_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch recognition' }, { status: 500 });
    }

    if (!recognition) {
      return NextResponse.json({ error: 'Recognition not found' }, { status: 404 });
    }

    if (recognition.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own recognitions' },
        { status: 403 }
      );
    }

    // Delete the recognition
    const { error: deleteError } = await supabase.from('peer_recognition').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete recognition' }, { status: 500 });
    }

    // Log the deletion for analytics
    await supabase.from('metrics').insert([
      {
        event: 'recognition_deleted',
        user_id: user.id,
        metadata: { recognition_id: id },
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in recognition delete API:', error);

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
