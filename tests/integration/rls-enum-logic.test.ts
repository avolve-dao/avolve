import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/types/database';
import { expect, test, describe } from 'vitest';

// Adjust these with your Supabase project details or use env variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

describe('RLS and Enum Integration', () => {
  test('Cannot insert invalid token_type into tokens', async () => {
    const { error } = await supabase.from('tokens').insert({
      user_id: '00000000-0000-0000-0000-000000000001',
      token_type: 'INVALID' as any, // Invalid enum
      amount: 1,
      source: 'test'
    });
    expect(error).toBeTruthy();
    if (error) expect(error.message).toMatch(/invalid input value for enum/i);
  });

  test('Can insert valid token_type into tokens', async () => {
    const { error } = await supabase.from('tokens').insert({
      user_id: '00000000-0000-0000-0000-000000000001',
      token_type: 'SAP',
      amount: 1,
      source: 'test'
    });
    expect(error).toBeFalsy();
  });

  test('RLS prevents unauthorized access to metrics', async () => {
    // Simulate anon client (no key)
    const anonSupabase = createClient<Database>(supabaseUrl, process.env.SUPABASE_ANON_KEY!);
    const { error } = await anonSupabase.from('metrics').select('*');
    expect(error).toBeTruthy();
    if (error) expect(error.message).toMatch(/permission denied/i);
  });
});
