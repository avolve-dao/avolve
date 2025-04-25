// Route handler for /api/email/send-invite
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import InviteEmail from '../../../../emails/InviteEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, confirmationUrl } = body;
    if (!to || !confirmationUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const emailHtml = InviteEmail({ confirmationUrl, email: to });
    const data = await resend.emails.send({
      from: 'Avolve+ <team@notifications.avolve.io>',
      to,
      subject: "You're Invited to Avolve!",
      react: emailHtml,
    });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
