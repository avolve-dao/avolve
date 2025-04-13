import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createPsibaseSimulator, PsibaseTransaction } from '@/lib/psibase/PsibaseSimulator';

/**
 * POST /api/psibase
 * 
 * Simulates a Psibase blockchain transaction
 * This endpoint validates and processes transactions according to Psibase-like rules
 * while storing data in Supabase until actual Psibase integration is complete
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required for Psibase transactions' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.action || !body.payload) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: action, payload' },
        { status: 400 }
      );
    }
    
    // Create transaction object
    const transaction: PsibaseTransaction = {
      sender: user.id,
      action: body.action,
      payload: body.payload,
      timestamp: new Date().toISOString(),
      metadata: body.metadata || {}
    };
    
    // Initialize Psibase simulator
    const psibaseSimulator = createPsibaseSimulator(supabase);
    
    // Validate transaction
    const validationResult = await psibaseSimulator.validateTransaction(transaction);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: 'Validation Failed', 
          message: 'Transaction validation failed',
          details: validationResult.errors 
        },
        { status: 422 }
      );
    }
    
    // Execute transaction
    const executionResult = await psibaseSimulator.executeTransaction(transaction);
    
    if (!executionResult.success) {
      return NextResponse.json(
        { 
          error: 'Transaction Failed', 
          message: executionResult.error || 'Failed to execute transaction' 
        },
        { status: 500 }
      );
    }
    
    // Return successful response
    return NextResponse.json({
      success: true,
      transaction_id: executionResult.transactionId,
      block_height: executionResult.blockHeight,
      timestamp: executionResult.timestamp,
      result: executionResult.result
    });
  } catch (error) {
    console.error('Error processing Psibase transaction:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error processing transaction' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/psibase?transaction_id=:id
 * 
 * Retrieves the status and result of a previously executed Psibase transaction
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required for Psibase transactions' },
        { status: 401 }
      );
    }
    
    // Get transaction ID from query params
    const transactionId = request.nextUrl.searchParams.get('transaction_id');
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required parameter: transaction_id' },
        { status: 400 }
      );
    }
    
    // Query the transaction
    const { data: transaction, error: txError } = await supabase
      .from('psibase_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    if (txError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this transaction
    // For now, only the sender can view their transactions
    if (transaction.sender !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to view this transaction' },
        { status: 403 }
      );
    }
    
    // Return transaction data
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.transaction_id,
        sender: transaction.sender,
        action: transaction.action,
        status: transaction.status,
        timestamp: transaction.timestamp,
        result: transaction.result
      }
    });
  } catch (error) {
    console.error('Error retrieving Psibase transaction:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error retrieving transaction' 
      },
      { status: 500 }
    );
  }
}
