/**
 * Supabase Edge Function: send_onboarding_reminders
 *
 * Purpose: Scheduled job to send onboarding reminders to users who are stuck (not completed onboarding after X days).
 * - Notifies the user via user_notifications.
 * - Optionally notifies the assigned support admin (if tracked).
 * - Logs all actions for auditability.
 *
 * Security: Uses service_role key for automation, in line with RLS policies.
 *
 * Usage: Deploy and schedule via Supabase dashboard or CLI.
 */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REMINDER_INTERVAL_DAYS = 3; // How many days of inactivity before reminder

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // 1. Find users whose onboarding is incomplete and haven't updated in REMINDER_INTERVAL_DAYS
    const { data: stuckUsers, error: stuckUsersError } = await supabase
      .from('user_onboarding')
      .select('user_id, updated_at')
      .is('completed_at', null)
      .lt('updated_at', new Date(Date.now() - REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString());

    if (stuckUsersError) {
      console.error('Failed to query stuck users:', stuckUsersError);
      return new Response(JSON.stringify({ error: 'Failed to query stuck users.' }), { status: 500 });
    }

    if (!stuckUsers || stuckUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No stuck users found.' }), { status: 200 });
    }

    // 2. For each stuck user, insert a reminder notification
    let remindersSent = 0;
    for (const user of stuckUsers) {
      // Check if a reminder was sent in the last REMINDER_INTERVAL_DAYS
      const { data: recentReminders, error: remindersError } = await supabase
        .from('user_notifications')
        .select('id, created_at')
        .eq('user_id', user.user_id)
        .eq('type', 'onboarding_reminder')
        .gt('created_at', new Date(Date.now() - REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString());

      if (remindersError) {
        console.error('Failed to query recent reminders:', remindersError);
        continue;
      }
      if (recentReminders && recentReminders.length > 0) {
        // Already reminded recently
        continue;
      }
      // Insert reminder
      const { error: insertError } = await supabase.from('user_notifications').insert([
        {
          user_id: user.user_id,
          type: 'onboarding_reminder',
          message: 'Friendly reminder: Please complete your onboarding steps to unlock all features!',
          status: 'sent',
          metadata: { automated: true },
        },
      ]);
      if (insertError) {
        console.error('Failed to insert onboarding reminder:', insertError);
        continue;
      }
      remindersSent++;
    }
    return new Response(JSON.stringify({ message: `Reminders sent: ${remindersSent}` }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error in send_onboarding_reminders:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error.' }), { status: 500 });
  }
});
