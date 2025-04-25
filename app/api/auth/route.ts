import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const formData = await request.formData();
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const cookieStore = cookies();

    const supabase = createClient(undefined, undefined, { cookies: cookieStore });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${error.message}`, {
        status: 301,
      });
    }

    return NextResponse.redirect(requestUrl.origin, {
      status: 301,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        route: '/api/auth',
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      })
    );
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();

  if (code) {
    const supabase = createClient(undefined, undefined, { cookies: cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(requestUrl.origin);
}
