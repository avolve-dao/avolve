import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password, inviteCode } = req.body;
  if (!email || !password || !inviteCode) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // 1. Validate invitation code
  const { data: invites, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('used', false)
    .limit(1);

  if (inviteError) {
    return res.status(500).json({ error: 'Database error' });
  }
  if (!invites || invites.length === 0) {
    return res.status(403).json({ error: 'Invalid or already used invitation code.' });
  }

  // 2. Register user
  const { error: signUpError, user } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    return res.status(400).json({ error: signUpError.message });
  }

  // 3. Mark invitation as used
  await supabase
    .from('invitations')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', invites[0].id);

  return res.status(200).json({ message: 'Registration successful! Please check your email to verify your account.' });
}
