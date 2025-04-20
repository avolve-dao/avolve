import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const supabase = createServerClient({ cookies })

    const { fromToken, toToken, amount } = await req.json()

    if (!fromToken || !toToken || !amount) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Call the convert_tokens function
    const { data, error } = await supabase.rpc('convert_tokens', {
      p_user_id: user.id,
      p_from_token_id: fromToken,
      p_to_token_id: toToken,
      p_amount: amount
    })

    if (error) {
      console.error('Token conversion error:', error)
      return new NextResponse(error.message, { status: 400 })
    }

    return NextResponse.json({ transactionId: data })
  } catch (error) {
    console.error('Error converting tokens:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
