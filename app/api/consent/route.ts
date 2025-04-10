import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * POST /api/consent
 * 
 * Creates a new consent record for the authenticated user
 * Implements The Prime Law's principles of voluntary consent
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to record consent' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { interaction_type, terms, status = 'approved', metadata = {} } = body;
    
    // Validate required fields
    if (!interaction_type || !terms) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: interaction_type, terms' },
        { status: 400 }
      );
    }
    
    // Get client IP and user agent for audit trail
    const ip_address = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';
    
    // Add metadata for audit purposes
    const enrichedMetadata = {
      ...metadata,
      ip_address,
      user_agent,
      timestamp: new Date().toISOString()
    };
    
    // Insert consent record
    const { data, error } = await supabase
      .from('user_consent')
      .insert({
        user_id: user.id,
        interaction_type,
        terms,
        status,
        metadata: enrichedMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('consent_id')
      .single();
    
    if (error) {
      console.error('Error recording consent:', error);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to record consent' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Consent recorded successfully',
      consent_id: data.consent_id
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
 * GET /api/consent
 * 
 * Retrieves consent records for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to view consent records' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const interaction_type = searchParams.get('interaction_type');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    // Build query
    let query = supabase
      .from('user_consent')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (from) {
      query = query.gte('created_at', from);
    }
    
    if (to) {
      query = query.lte('created_at', to);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching consent records:', error);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch consent records' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      records: data
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
 * PATCH /api/consent/:id
 * 
 * Updates a consent record (e.g., to revoke consent)
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Get consent ID from URL
    const consentId = params.id;
    
    if (!consentId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing consent ID' },
        { status: 400 }
      );
    }
    
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
