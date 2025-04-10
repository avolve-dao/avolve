/**
 * Journey AI Interaction Tracking API Route
 * 
 * Tracks user interactions with AI recommendations for improving future suggestions
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { userId, recommendationId, action, timestamp } = body;
    
    // Verify user ID matches authenticated user or is admin
    if (userId !== session.user.id) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (!userRole || userRole.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Cannot track interactions for another user' },
          { status: 403 }
        );
      }
    }
    
    // Record the interaction
    const { error } = await supabase
      .from('recommendation_interactions')
      .insert({
        user_id: userId,
        recommendation_id: recommendationId,
        action,
        interaction_date: timestamp || new Date().toISOString()
      });
    
    if (error) {
      console.error('Error recording interaction:', error);
      return NextResponse.json(
        { error: 'Failed to record interaction' },
        { status: 500 }
      );
    }
    
    // Broadcast update to recommendation channel
    await supabase
      .channel('ai-recommendations')
      .send({
        type: 'broadcast',
        event: 'recommendation_interaction',
        payload: {
          userId,
          recommendationId,
          action,
          timestamp: timestamp || new Date().toISOString()
        }
      });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in track-interaction route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
