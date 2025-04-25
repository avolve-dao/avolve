// Next.js API route for fetching team census data via Supabase Data API
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key should only be used server-side
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Optionally, add pagination or filtering here
  const { data, error } = await supabase.from('team_census').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}
