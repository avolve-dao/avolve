import { getContextualGrokModel } from '@/lib/grok-context';
import { streamText } from '@/lib/ai-sdk-setup';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { content, userId } = await req.json();

    if (!content || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content and userId are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get contextual Grok model
    const { model, context } = await getContextualGrokModel(userId);

    // Generate 3 different enhancements
    const enhancements: string[] = [];

    const enhancementTypes: string[] = [
      'Make it more engaging and conversational',
      'Make it more professional and polished',
      'Add relevant hashtags and make it more shareable',
    ];

    for (const type of enhancementTypes) {
      const response = await streamText({
        model,
        prompt: `Enhance this social media post: "${content}"
 
 Enhancement type: ${type}
 
 Consider the user's interests: ${context.profile?.interests || 'Unknown'}
 Consider platform trends: ${Array.isArray(context.trendingTopics) ? context.trendingTopics.map((t: { content: string }) => t.content.substring(0, 30)).join(', ') : 'None available'}
 Consider the user's recent activity: ${
   Array.isArray(context.recentActivity)
     ? context.recentActivity
         .slice(0, 2)
         .map((a: { action_type: string }) => a.action_type)
         .join(', ')
     : 'None available'
 }
 
 Guidelines:
 - Maintain the user's original voice and intent
 - Keep a similar length to the original
 - For hashtags, include 2-4 relevant tags
 - For engaging content, add a question or call to action
 - For authentic tone, make it sound natural and conversational
 
 Provide only the enhanced post text without any additional explanations or formatting.`,
      });

      // Read the stream content manually
      let text = '';
      const reader = response.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += value;
      }

      enhancements.push(text);
    }

    // Log enhancement request for improving future suggestions
    try {
      const supabase = await createClient();
      await (supabase as any).from('ai_enhancement_logs').insert({
        user_id: userId,
        original_content: content,
        enhancement_types: enhancementTypes,
        result_count: enhancements.length,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      // Non-critical, just log the error
      console.error('Error logging enhancement:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        enhancements,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error enhancing post:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to enhance post',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
