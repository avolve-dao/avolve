"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  recognitionsThisMonth: number;
  onboardedThisWeek: number;
  stuckUsers: number;
}

export function AdminDashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const supabase = createClient();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfWeekISO = startOfWeek.toISOString();

      // Recognitions this month
      const { count: recognitionsThisMonth } = await supabase
        .from('gratitude_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);
      // Users onboarded this week
      const { count: onboardedThisWeek } = await supabase
        .from('user_onboarding')
        .select('user_id', { count: 'exact', head: true })
        .not('completed_at', 'is', null)
        .gte('completed_at', startOfWeekISO);
      // Stuck users
      const { count: stuckUsers } = await supabase
        .from('user_onboarding')
        .select('user_id', { count: 'exact', head: true })
        .is('completed_at', null);
      setStats({
        recognitionsThisMonth: recognitionsThisMonth || 0,
        onboardedThisWeek: onboardedThisWeek || 0,
        stuckUsers: stuckUsers || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="py-4 text-center">Loading stats...</div>;

  return (
    <div className="flex gap-6 mb-8">
      <div className="bg-emerald-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-emerald-700">{stats.recognitionsThisMonth}</div>
        <div className="text-xs text-gray-600">Recognitions this month</div>
      </div>
      <div className="bg-blue-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-blue-700">{stats.onboardedThisWeek}</div>
        <div className="text-xs text-gray-600">Users onboarded this week</div>
      </div>
      <div className="bg-orange-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-orange-700">{stats.stuckUsers}</div>
        <div className="text-xs text-gray-600">Users stuck in onboarding</div>
      </div>
    </div>
  );
}
