import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

/**
 * Gets the current authenticated user
 */
async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * POST /api/consent
 * 
 * Creates a new consent record for the authenticated user
 * Implements The Prime Law's principles of voluntary consent
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { interaction_type, terms, status = 'pending' } = await request.json();
    
    if (!interaction_type || !terms) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const metadata = {
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'unknown'
    };
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data, error } = await supabase
      .from('user_consent')
      .insert({
        user_id: user.id,
        interaction_type,
        terms,
        status,
        metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error recording consent:', error);
      return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Consent recorded successfully',
      record: data
    }, { status: 200 });
  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}

/**
 * GET /api/consent
 * 
 * Retrieves consent records for the authenticated user
 * If consent_id is provided as a query parameter, retrieves a specific consent record
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = request.nextUrl;
    const interaction_type = searchParams.get('interaction_type');
    const status = searchParams.get('status');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    let query = supabase
      .from('user_consent')
      .select('*')
      .eq('user_id', user.id);
    
    if (interaction_type) {
      query = query.eq('interaction_type', interaction_type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (from_date) {
      query = query.gte('created_at', new Date(`${from_date}T00:00:00.000Z`).toISOString());
    }
    
    if (to_date) {
      query = query.lte('created_at', new Date(`${to_date}T23:59:59.999Z`).toISOString());
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching consent records:', error);
      return NextResponse.json({ error: 'Failed to fetch consent records' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      records: data || []
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching consent records:', error);
    return NextResponse.json({ error: 'Failed to fetch consent records' }, { status: 500 });
  }
}

/**
 * PATCH /api/consent
 * 
 * Updates a consent record (e.g., to revoke consent)
 * Requires consent_id in the request body
 */
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { consent_id, status } = await request.json();
    
    if (!consent_id || !status) {
      return NextResponse.json({ error: 'Missing required fields: consent_id and status are required' }, { status: 400 });
    }
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // First check if the consent record belongs to the user
    const { data: existingConsent, error: fetchError } = await supabase
      .from('user_consent')
      .select('user_id')
      .eq('consent_id', consent_id)
      .single();
    
    if (fetchError || !existingConsent) {
      return NextResponse.json({ error: 'Consent record not found' }, { status: 404 });
    }
    
    if (existingConsent.user_id !== user.id) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You can only update your own consent records'
      }, { status: 403 });
    }
    
    const { error: updateError } = await supabase
      .from('user_consent')
      .update({ status })
      .eq('consent_id', consent_id)
      .single();
    
    if (updateError) {
      console.error('Error updating consent:', updateError);
      return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Consent record updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}
