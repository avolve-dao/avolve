import React, { ReactNode } from 'react';

interface DashboardProps {
  children: ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {children}
    </main>
  );
};
