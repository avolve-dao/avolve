"use client";

// Minimal admin dashboard for launch. TODO: Add admin widgets (GratitudeFeed, StuckOnboardingTable, AdminDashboardStats) when ready.

export default function AdminDashboardPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-8">
        <p className="text-lg text-gray-700">Welcome, admin! Here you can monitor onboarding, view recognitions, and support new users.</p>
      </div>
      {/* TODO: Add admin widgets (GratitudeFeed, StuckOnboardingTable, AdminDashboardStats) here. */}
    </div>
  );
}
