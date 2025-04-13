import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's token balances with token type information
    const { data: balances, error } = await supabase
      .from('token_balances')
      .select(`
        *,
        token_type:token_types(*)
      `)
      .eq('user_id', session.user.id)

    if (error) throw error

    return NextResponse.json(balances)
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
