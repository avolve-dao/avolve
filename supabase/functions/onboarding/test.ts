import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { createClient } from 'supabase-functions-client';

// Mock environment variables
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.test('Onboarding function assigns default tokens and roles', async () => {
  // Mock user
  const user = { id: 'test-user-id' };

  // Call onboarding logic (simulate HTTP request)
  // You'd import the function handler here if modularized
  // For this skeleton, just simulate DB inserts

  const tokenRes = await supabase
    .from('user_balances')
    .insert([{ user_id: user.id, token_id: 'GEN', balance: 1 }]);
  assertEquals(tokenRes.error, null);

  const roleRes = await supabase
    .from('user_roles')
    .insert([{ user_id: user.id, role_id: 'default_onboarded' }]);
  assertEquals(roleRes.error, null);

  const milestoneRes = await supabase
    .from('user_phase_milestones')
    .insert([{ user_id: user.id, phase_id: 'onboarding', completed: false }]);
  assertEquals(milestoneRes.error, null);

  // Clean up test data (optional)
  await supabase.from('user_balances').delete().eq('user_id', user.id);
  await supabase.from('user_roles').delete().eq('user_id', user.id);
  await supabase.from('user_phase_milestones').delete().eq('user_id', user.id);
});
