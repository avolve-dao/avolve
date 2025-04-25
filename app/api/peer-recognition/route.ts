import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/peer-recognition: Send a recognition
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { recipient_id, message, badge } = await req.json();
  const {
    data: { user },
    error: userError,
  } = await (supabase as any).auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!recipient_id || !message) {
    return NextResponse.json({ error: 'Recipient and message are required.' }, { status: 400 });
  }
  if (recipient_id === user.id) {
    return NextResponse.json({ error: 'You cannot recognize yourself.' }, { status: 400 });
  }
  const { error } = await (supabase as any).from('peer_recognition').insert({
    sender_id: user.id,
    recipient_id,
    message,
    badge: badge || null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// GET /api/peer-recognition: List recognitions sent or received by user
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await (supabase as any).auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await (supabase as any)
    .from('peer_recognition')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ recognitions: data });
}

// DELETE /api/peer-recognition: Delete a recognition
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Recognition ID is required.' }, { status: 400 });
    }
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    // Only allow sender or admin to delete
    const { data: rec, error: recError } = await (supabase as any)
      .from('peer_recognition')
      .select('id,sender_id')
      .eq('id', id)
      .single();
    if (recError || !rec) {
      return NextResponse.json({ error: 'Recognition not found.' }, { status: 404 });
    }
    if (rec.sender_id !== user.id /* && !user.is_admin */) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recognition.' },
        { status: 403 }
      );
    }
    const { error: delError } = await (supabase as any)
      .from('peer_recognition')
      .delete()
      .eq('id', id);
    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
