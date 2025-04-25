import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Logs an admin or sensitive action for audit purposes.
 * @param actorId - The user ID performing the action
 * @param action - The action performed (e.g., 'role_change', 'user_ban')
 * @param target - The target of the action (user ID, entity ID, etc.)
 * @param details - Optional details about the action
 */
export async function logAuditAction(
  actorId: string,
  action: string,
  target: string,
  details?: Record<string, any>
) {
  const supabase = createClient() as SupabaseClient<Database>;
  await supabase.from('audit_logs').insert([
    {
      actor_id: actorId,
      action,
      target,
      details: details || null,
      timestamp: new Date().toISOString(),
    },
  ]);
}

/**
 * Usage example:
 * await logAuditAction(user.id, 'role_change', targetUserId, { from: 'member', to: 'admin' });
 */
