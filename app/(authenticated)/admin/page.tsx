"use client";

// Minimal placeholder page for future implementation
import { useUser } from '@/lib/hooks/use-user';
import { GratitudeFeed } from '@/components/admin/GratitudeFeed';
import { StuckOnboardingTable } from '@/components/admin/StuckOnboardingTable';
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats';

export default function AdminDashboardPage() {
  const { user } = useUser();
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboardStats />
      <div className="mb-8">
        <p className="text-lg text-gray-700">Welcome, admin! Here you can monitor onboarding, view recognitions, and support new users.</p>
      </div>
      {user?.id && <GratitudeFeed adminId={user.id} />}
      <StuckOnboardingTable />
      {/* TODO: Add reminders sent, and actionable admin widgets here. */}
    </div>
  );
}
