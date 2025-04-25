import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Call the RPC function to get free membership status
    const { data, error } = await (supabase as any).rpc('get_free_membership_status');

    if (error) {
      console.error('Error fetching free membership status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch free membership status' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
