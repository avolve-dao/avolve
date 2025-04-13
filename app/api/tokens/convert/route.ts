import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { fromToken, toToken, amount } = await request.json()

    if (!fromToken || !toToken || !amount) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Call the convert_tokens function
    const { data, error } = await supabase.rpc('convert_tokens', {
      p_user_id: session.user.id,
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
