/**
 * Journey AI Recommendations API Route
 * 
 * Provides personalized AI-driven recommendations based on user's regen analytics
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
// import { Database } from '@/types/supabase'; // Temporarily removed due to missing export
import { OpenAI } from 'openai';

// Only instantiate OpenAI if the API key is present
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.warn('[Avolve] OPENAI_API_KEY is not set. AI recommendations endpoint will return 503.');
}

export async function POST(request: NextRequest) {
  if (!openaiApiKey) {
    return NextResponse.json({
      success: false,
      error: 'OPENAI_API_KEY is not set. This endpoint is unavailable.',
      data: null,
    }, { status: 503 });
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    // Verify user ID matches authenticated user or is admin
    if (userId !== user.id) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (!userRole || userRole.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access another user\'s recommendations' },
          { status: 403 }
        );
      }
    }

    // Fetch user's regen analytics data
    const { data: regenData, error: regenError } = await supabase
      .from('regen_analytics_mv')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (regenError) {
      console.error('Error fetching regen analytics:', regenError);
      return NextResponse.json(
        { error: 'Failed to fetch user analytics' },
        { status: 500 }
      );
    }

    // Fetch user's journey progress
    const { data: journeyProgress, error: journeyError } = await supabase.rpc(
      'get_user_progress',
      { user_id_param: userId }
    );
    
    if (journeyError) {
      console.error('Error fetching journey progress:', journeyError);
      return NextResponse.json(
        { error: 'Failed to fetch user journey progress' },
        { status: 500 }
      );
    }

    // Fetch user's token balances
    const { data: tokenBalances, error: tokenError } = await supabase
      .from('user_balances')
      .select('token_id, balance')
      .eq('user_id', userId);
    
    if (tokenError) {
      console.error('Error fetching token balances:', tokenError);
      return NextResponse.json(
        { error: 'Failed to fetch user token balances' },
        { status: 500 }
      );
    }

    // Fetch upcoming events
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gt('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5);
    
    if (eventsError) {
      console.error('Error fetching upcoming events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch upcoming events' },
        { status: 500 }
      );
    }

    // Fetch user's completed events
    const { data: completedEvents, error: completedError } = await supabase
      .from('event_completions')
      .select('event_id')
      .eq('user_id', userId);
    
    if (completedError) {
      console.error('Error fetching completed events:', completedError);
      return NextResponse.json(
        { error: 'Failed to fetch completed events' },
        { status: 500 }
      );
    }

    // Fetch user's streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_token_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') { // Not found is okay
      console.error('Error fetching streak data:', streakError);
      return NextResponse.json(
        { error: 'Failed to fetch streak data' },
        { status: 500 }
      );
    }

    // Generate AI-driven recommendations based on collected data
    const prompt = `Based on the user's regen analytics ${JSON.stringify(regenData)}, 
                   journey progress ${JSON.stringify(journeyProgress)}, 
                   token balances ${JSON.stringify(tokenBalances)}, 
                   upcoming events ${JSON.stringify(upcomingEvents)}, 
                   completed events ${JSON.stringify(completedEvents)}, 
                   and streak data ${JSON.stringify(streakData)}, 
                   suggest 3 personalized recommendations for their next steps.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping users on their personal development journey.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const recommendations = completion.choices[0].message.content;

    // Return recommendations
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Unexpected error in journey-ai recommendations route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
