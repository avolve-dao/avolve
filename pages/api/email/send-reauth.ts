import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import ReauthEmail from '../../../emails/ReauthEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, confirmationUrl } = req.body;
  if (!to || !confirmationUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const emailHtml = ReauthEmail({ confirmationUrl, email: to });
    const data = await resend.emails.send({
      from: 'Avolve+ <team@notifications.avolve.io>',
      to,
      subject: 'Verify Your Identity',
      react: emailHtml,
    });
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
