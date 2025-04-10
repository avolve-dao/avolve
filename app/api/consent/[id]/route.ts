import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * GET handler for retrieving a specific consent record
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const id = params.id;
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to view consent records' },
        { status: 401 }
      );
    }
    
    // Fetch the consent record
    const { data, error } = await supabase
      .from('user_consent')
      .select('*')
      .eq('consent_id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Consent record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      record: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a consent record
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const id = params.id;
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update consent records' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { status, metadata } = body;
    
    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required field: status' },
        { status: 400 }
      );
    }
    
    // Check if consent record exists and belongs to user
    const { data: existingConsent, error: fetchError } = await supabase
      .from('user_consent')
      .select('user_id')
      .eq('consent_id', id)
      .single();
    
    if (fetchError || !existingConsent) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Consent record not found' },
        { status: 404 }
      );
    }
    
    if (existingConsent.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update your own consent records' },
        { status: 403 }
      );
    }
    
    // Update consent record
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...(metadata ? { metadata } : {})
    };
    
    const { error: updateError } = await supabase
      .from('user_consent')
      .update(updateData)
      .eq('consent_id', id);
    
    if (updateError) {
      console.error('Error updating consent record:', updateError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to update consent record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Consent record updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
