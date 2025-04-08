import React from 'react';
import { SubscriptionManager } from '../../components/Subscription';

export const metadata = {
  title: 'Subscription Management | Avolve',
  description: 'Manage your Avolve subscription and token allocations',
};

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      <div className="max-w-4xl mx-auto">
        <SubscriptionManager />
      </div>
    </div>
  );
}
