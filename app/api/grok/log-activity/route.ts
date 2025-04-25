import { logActivityServer } from '@/lib/activity-logger-server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    // Validate the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the activity data from the request
    const { action, entityType, content } = await req.json();

    // Log the activity using the server-side function
    await logActivityServer({
      userId: user.id,
      action,
      entityType,
      entityId: nanoid(),
      metadata: {
        type: `grok_${entityType}`,
        content: content.substring(0, 100),
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to log activity' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
