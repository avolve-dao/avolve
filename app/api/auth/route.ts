import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  const { event, session } = await request.json()

  if (event === 'SIGNED_IN') {
    await supabase.auth.setSession(session)
  }

  return NextResponse.json({
    message: 'Auth event handled successfully'
  }, {
    status: 200,
    headers: {
      'Location': requestUrl.origin
    }
  })
}
