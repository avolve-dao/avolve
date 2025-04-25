// Route handler for /api/email/preview
import { NextRequest, NextResponse } from 'next/server';
import ConfirmEmail from '../../../../emails/ConfirmEmail';
import InviteEmail from '../../../../emails/InviteEmail';
import MagicLinkEmail from '../../../../emails/MagicLinkEmail';
import ChangeEmail from '../../../../emails/ChangeEmail';
import ResetPasswordEmail from '../../../../emails/ResetPasswordEmail';
import ReauthEmail from '../../../../emails/ReauthEmail';

const templates = {
  confirm: ConfirmEmail,
  invite: InviteEmail,
  magic: MagicLinkEmail,
  change: ChangeEmail,
  reset: ResetPasswordEmail,
  reauth: ReauthEmail,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'invite';
  const email = searchParams.get('email') || 'user@example.com';
  const urlParam = searchParams.get('url') || 'https://avolve.io/magic';
  const Template = templates[type as keyof typeof templates] || InviteEmail;
  const element = Template({ confirmationUrl: urlParam, email });
  return new Response(`<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Email Preview</title></head><body>${element}</body></html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
}
