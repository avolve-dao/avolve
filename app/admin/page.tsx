import React from 'react';
import { AdminUserTable } from '@/components/admin/AdminUserTable';
import { TokenAnalytics } from '@/components/admin/TokenAnalytics';
import { PhaseManagement } from '@/components/admin/PhaseManagement';

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <AdminUserTable />
        </div>
        <div>
          <TokenAnalytics />
          <PhaseManagement />
        </div>
      </div>
    </div>
  );
}
