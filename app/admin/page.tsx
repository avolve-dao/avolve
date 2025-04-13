import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check for admin role
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || userRole?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch platform statistics
  const { count: userCount, error: userCountError } = await supabase
    .from('users')
    .select('*', { count: 'exact' });

  if (userCountError) {
    console.error('Error fetching user count:', userCountError.message);
  }

  const { count: questCount, error: questCountError } = await supabase
    .from('quests')
    .select('*', { count: 'exact' });

  if (questCountError) {
    console.error('Error fetching quest count:', questCountError.message);
  }

  const { count: tokenCount, error: tokenCountError } = await supabase
    .from('token_types')
    .select('*', { count: 'exact' });

  if (tokenCountError) {
    console.error('Error fetching token count:', tokenCountError.message);
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
        <p className="text-muted-foreground mb-4">Welcome, Admin. Here you can manage all aspects of the Avolve platform.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-3xl font-bold text-primary">{userCount || 'N/A'}</p>
          <p className="text-muted-foreground mt-1">Total registered users</p>
          <a href="/admin/users" className="inline-block text-primary font-medium hover:underline mt-2">Manage Users →</a>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-2">Quests</h2>
          <p className="text-3xl font-bold text-primary">{questCount || 'N/A'}</p>
          <p className="text-muted-foreground mt-1">Active quests & challenges</p>
          <a href="/admin/quests" className="inline-block text-primary font-medium hover:underline mt-2">Manage Quests →</a>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-2">Token Types</h2>
          <p className="text-3xl font-bold text-primary">{tokenCount || 'N/A'}</p>
          <p className="text-muted-foreground mt-1">Unique token types in circulation</p>
          <a href="/admin/tokens" className="inline-block text-primary font-medium hover:underline mt-2">Manage Tokens →</a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Moderation</h2>
          <p className="text-muted-foreground mb-4">Review reported content and manage user behavior to maintain platform integrity.</p>
          <div className="space-y-2">
            <a href="/admin/moderation/reports" className="block text-primary hover:underline">Content Reports</a>
            <a href="/admin/moderation/bans" className="block text-primary hover:underline">User Bans & Warnings</a>
            <a href="/admin/moderation/guidelines" className="block text-primary hover:underline">Community Guidelines</a>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-muted-foreground mb-4">Configure platform-wide settings and policies.</p>
          <div className="space-y-2">
            <a href="/admin/settings/general" className="block text-primary hover:underline">General Settings</a>
            <a href="/admin/settings/invites" className="block text-primary hover:underline">Invite-Only Policies</a>
            <a href="/admin/settings/api" className="block text-primary hover:underline">API & Developer Access</a>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-xl font-semibold mb-4">Analytics & Reporting</h2>
        <p className="text-muted-foreground mb-4">View detailed analytics about user engagement, token circulation, quest completion rates, and more.</p>
        <a href="/admin/analytics" className="inline-block text-primary font-medium hover:underline">View Analytics Dashboard →</a>
      </div>
      
      <div className="bg-card rounded-lg shadow-md p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Admin Logs</h2>
        <p className="text-muted-foreground mb-4">Review logs of administrative actions for transparency and accountability.</p>
        <a href="/admin/logs" className="inline-block text-primary font-medium hover:underline">View Admin Logs →</a>
      </div>
    </div>
  );
}
