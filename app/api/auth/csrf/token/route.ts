import { generateCsrfToken } from '@/lib/csrf-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = await generateCsrfToken();

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json({ error: 'Failed to generate security token' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Your business logic here
  } catch (error) {
    console.error(
      JSON.stringify({
        route: '/api/auth/csrf/token',
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      })
    );
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
