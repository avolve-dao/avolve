import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/user/profiles: List all user profiles (id, full_name, avatar_url)
export async function GET() {
  try {
    const supabase = createClient();
    // Fix for: This expression is not callable. Each member of the union type ...
    // Use supabase.from(...)
    const { data, error } = await (supabase as any).from('profiles').select('id, full_name, avatar_url').order('full_name', { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ profiles: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
