"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  recognitionsThisMonth: number;
  onboardedThisWeek: number;
  stuckUsers: number;
  invitesSent: number;
  invitesAccepted: number;
  invitesCompleted: number;
  recentAchievements: any[];
  recentPosts: any[];
  recentFeedback: any[];
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
      // Onboarding funnel
      const { count: invitesSent } = await supabase
        .from('invites')
        .select('id', { count: 'exact', head: true });
      const { count: invitesAccepted } = await supabase
        .from('invites')
        .select('id', { count: 'exact', head: true })
        .not('accepted_at', 'is', null);
      const { count: invitesCompleted } = await supabase
        .from('invites')
        .select('id', { count: 'exact', head: true })
        .not('completed_at', 'is', null);
      // Recent activity
      const recentAchievements = await supabase
        .from('achievements')
        .select('id, title, description')
        .order('created_at', { ascending: false })
        .limit(5);
      const recentPosts = await supabase
        .from('posts')
        .select('id, title, content')
        .order('created_at', { ascending: false })
        .limit(5);
      const recentFeedback = await supabase
        .from('feedback')
        .select('id, title, description')
        .order('created_at', { ascending: false })
        .limit(5);
      setStats({
        recognitionsThisMonth: recognitionsThisMonth || 0,
        onboardedThisWeek: onboardedThisWeek || 0,
        stuckUsers: stuckUsers || 0,
        invitesSent: invitesSent || 0,
        invitesAccepted: invitesAccepted || 0,
        invitesCompleted: invitesCompleted || 0,
        recentAchievements: recentAchievements.data || [],
        recentPosts: recentPosts.data || [],
        recentFeedback: recentFeedback.data || [],
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="py-4 text-center">Loading stats...</div>;

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Onboarding funnel */}
      <div className="bg-emerald-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-emerald-700">{stats.invitesSent}</div>
        <div className="text-xs text-gray-600">Invites sent</div>
      </div>
      <div className="bg-blue-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-blue-700">{stats.invitesAccepted}</div>
        <div className="text-xs text-gray-600">Invites accepted</div>
      </div>
      <div className="bg-orange-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-orange-700">{stats.invitesCompleted}</div>
        <div className="text-xs text-gray-600">Invites completed</div>
      </div>
      {/* Recent activity */}
      <div className="bg-gray-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-gray-700">Recent activity</div>
        <div className="flex flex-col gap-2">
          {stats.recentAchievements.map((achievement) => (
            <div key={achievement.id}>{achievement.title}</div>
          ))}
          {stats.recentPosts.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
          {stats.recentFeedback.map((feedback) => (
            <div key={feedback.id}>{feedback.title}</div>
          ))}
        </div>
      </div>
      {/* Quick actions */}
      <div className="bg-gray-50 rounded-lg px-6 py-4 flex flex-col items-center shadow">
        <div className="text-2xl font-bold text-gray-700">Quick actions</div>
        <div className="flex flex-col gap-2">
          <button className="bg-emerald-50 rounded-lg px-6 py-4 text-emerald-700">Welcome new user</button>
          <button className="bg-blue-50 rounded-lg px-6 py-4 text-blue-700">Send nudge</button>
          <button className="bg-orange-50 rounded-lg px-6 py-4 text-orange-700">Review feature requests</button>
        </div>
      </div>
    </div>
  );
}
