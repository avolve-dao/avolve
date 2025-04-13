import React from 'react';
import CreateTeamForm from '@/components/Teams/CreateTeamForm';

export const metadata = {
  title: 'Create Team | Avolve',
  description: 'Create a new team to collaborate on superpuzzles',
};

export default function CreateTeamPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Create a Team</h1>
      <p className="text-slate-600 mb-8">
        Teams allow Superachievers to collaborate on superpuzzles and earn SCQ tokens together.
        You need to complete at least 10 challenges to create a team.
      </p>
      
      <CreateTeamForm />
    </div>
  );
}
