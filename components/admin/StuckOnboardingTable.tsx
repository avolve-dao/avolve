'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StuckUser {
  user_id: string;
  full_name: string;
  email: string;
  updated_at: string;
  completed_at: string | null;
  last_reminder: string | null;
}

export function StuckOnboardingTable() {
  const [users, setUsers] = useState<StuckUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStuckUsers() {
      setLoading(true);
      const supabase = createClient();
      // Find users whose onboarding is incomplete
      const { data, error } = await supabase
        .from('user_onboarding')
        .select(`user_id, updated_at, completed_at, profiles:profiles(full_name, email)`)
        .is('completed_at', null)
        .order('updated_at', { ascending: true });
      if (!data) {
        setUsers([]);
        setLoading(false);
        return;
      }
      // For each user, find last onboarding_reminder
      const usersWithReminders = await Promise.all(
        data.map(async (u: any) => {
          const { data: reminders } = await supabase
            .from('user_notifications')
            .select('created_at')
            .eq('user_id', u.user_id)
            .eq('type', 'onboarding_reminder')
            .order('created_at', { ascending: false })
            .limit(1);
          return {
            user_id: u.user_id,
            full_name: u.profiles?.full_name || '',
            email: u.profiles?.email || '',
            updated_at: u.updated_at,
            completed_at: u.completed_at,
            last_reminder: reminders && reminders.length > 0 ? reminders[0].created_at : null,
          };
        })
      );
      setUsers(usersWithReminders);
      setLoading(false);
    }
    fetchStuckUsers();
  }, []);

  async function sendReminder(userId: string) {
    const supabase = createClient();
    // Optionally, show a spinner or disable the button for this user
    await supabase.functions.invoke('send_onboarding_reminder', { body: { userId } });
    // Optimistically update UI
    setUsers(users =>
      users.map(u => (u.user_id === userId ? { ...u, last_reminder: new Date().toISOString() } : u))
    );
  }

  if (loading) return <div className="p-4 text-center">Loading stuck users...</div>;

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No users are currently stuck in onboarding 🎉
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-2">Users Stuck in Onboarding</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Email</th>
            <th className="text-left">Last Progress</th>
            <th className="text-left">Last Reminder</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id} className="border-b last:border-b-0">
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.updated_at ? new Date(u.updated_at).toLocaleString() : '-'}</td>
              <td>
                {u.last_reminder ? (
                  new Date(u.last_reminder).toLocaleString()
                ) : (
                  <span className="text-red-500">Never</span>
                )}
              </td>
              <td>
                <button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                  onClick={() => sendReminder(u.user_id)}
                >
                  Send Reminder
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
