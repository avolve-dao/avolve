import React from 'react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="p-4 max-w-7xl mx-auto">{children}</div>;
}
