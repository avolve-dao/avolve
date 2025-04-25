// Route handler for /api/email/send-reauth
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import ReauthEmail from '../../../../emails/ReauthEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, confirmationUrl } = body;
    if (!to || !confirmationUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const emailHtml = ReauthEmail({ confirmationUrl, email: to });
    const data = await resend.emails.send({
      from: 'Avolve+ <team@notifications.avolve.io>',
      to,
      subject: 'Verify Your Identity',
      react: emailHtml,
    });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
