import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const email = `testuser_${Math.floor(Math.random() * 100000)}@avolve.ai`;
  const password = 'TestUserPassword123!';
  console.log('Testing user creation with:', email);
  const { data, error } = await (supabase as any).auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error) {
    console.error('User creation failed:', JSON.stringify(error, null, 2));
  } else {
    console.log('User creation succeeded:', JSON.stringify(data, null, 2));
  }
}

main();
