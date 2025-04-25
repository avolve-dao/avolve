import { NextApiRequest, NextApiResponse } from 'next';
import ConfirmEmail from '../../../emails/ConfirmEmail';
import InviteEmail from '../../../emails/InviteEmail';
import MagicLinkEmail from '../../../emails/MagicLinkEmail';
import ChangeEmail from '../../../emails/ChangeEmail';
import ResetPasswordEmail from '../../../emails/ResetPasswordEmail';
import ReauthEmail from '../../../emails/ReauthEmail';

const templates = {
  confirm: ConfirmEmail,
  invite: InviteEmail,
  magic: MagicLinkEmail,
  change: ChangeEmail,
  reset: ResetPasswordEmail,
  reauth: ReauthEmail,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    type = 'invite',
    email = 'user@example.com',
    url = 'https://avolve.io/magic',
  } = req.query;
  const Template = templates[type as keyof typeof templates] || InviteEmail;
  const element = Template({ confirmationUrl: url as string, email: email as string });
  res.setHeader('Content-Type', 'text/html');
  res.send(
    `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Email Preview</title></head><body>${element}</body></html>`
  );
}
