import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

/**
 * PATCH /api/consent/:id
 * 
 * Updates a consent record (e.g., to revoke consent)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update consent records' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { status, metadata } = body;
    
    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required field: status' },
        { status: 400 }
      );
    }
    
    // Get consent ID from URL params
    const consentId = params.id;
    
    // Check if consent record exists and belongs to user
    const { data: existingConsent, error: fetchError } = await supabase
      .from('user_consent')
      .select('user_id')
      .eq('consent_id', consentId)
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
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    const { error: updateError } = await supabase
      .from('user_consent')
      .update(updateData)
      .eq('consent_id', consentId);
    
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
