import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/psibase
 * 
 * Simulates a Psibase blockchain transaction
 * This endpoint validates and processes transactions according to Psibase-like rules
 * while storing data in Supabase until actual Psibase integration is complete
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Psibase integration is currently disabled.' },
    { status: 501 }
  );
}

/**
 * GET /api/psibase?transaction_id=:id
 * 
 * Retrieves the status and result of a previously executed Psibase transaction
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Psibase integration is currently disabled.' },
    { status: 501 }
  );
}
