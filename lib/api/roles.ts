import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getRolePoints() {
  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : supabase.auth.user();
  if (!user) throw new Error('Not authenticated');
  // Use updated function/view for Fibonacci-based rewards if available
  const { data, error } = await supabase.rpc('get_role_points', { p_user_id: user.id });
  if (error) throw error;
  return data;
}

export async function getRoleHistory() {
  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : supabase.auth.user();
  if (!user) throw new Error('Not authenticated');
  // Use updated function/view for Fibonacci-based rewards if available
  const { data, error } = await supabase.rpc('get_role_history', { p_user_id: user.id, p_limit: 50 });
  if (error) throw error;
  return data;
}

// New: Fetch group event rewards (Fibonacci-based)
export async function getGroupEventRewards(eventId: string) {
  const { data, error } = await supabase
    .from('group_event_participants')
    .select('user_id, rank')
    .eq('event_id', eventId);
  if (error) throw error;
  // Calculate Fibonacci rewards client-side for display
  const fibonacci = (n: number): number => {
    let a = 0, b = 1, temp;
    for (let i = 0; i < n; i++) {
      temp = a + b;
      a = b;
      b = temp;
    }
    return a;
  };
  return data.map((row: any) => ({
    ...row,
    reward: fibonacci(2 + row.rank), // match backend logic
  }));
}
