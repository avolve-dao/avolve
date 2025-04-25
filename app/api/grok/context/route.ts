import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User ID is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = await createClient();

    // Get user profile
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get user's recent activity
    const { data: recentActivity } = await (supabase as any)
      .from('user_activity_feed')
      .select('action_type, entity_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get trending topics
    const { data: trendingPosts } = await (supabase as any)
      .from('posts')
      .select('content')
      .order('like_count', { ascending: false })
      .limit(3);

    // Format the context data
    const interests =
      profile?.interests
        ?.split(',')
        .map((i: string) => i.trim())
        .join(', ') || 'Not specified yet';

    const activitySummary =
      Array.isArray(recentActivity) && recentActivity.length
        ? recentActivity
            .map(
              (a: { action_type: string; entity_type: string }) =>
                `${a.action_type} a ${a.entity_type}`
            )
            .join(', ')
        : 'No recent activity';

    const trendingSummary =
      Array.isArray(trendingPosts) && trendingPosts.length
        ? trendingPosts
            .map((p: { content: string }) => p.content.substring(0, 30) + '...')
            .join(', ')
        : 'No trending topics available';

    return new Response(
      JSON.stringify({
        success: true,
        context: {
          interests,
          recentActivity: activitySummary,
          trends: trendingSummary,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching user context:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch user context',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
