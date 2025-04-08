import React from 'react';
import TeamDetails from '@/components/Teams/TeamDetails';

interface TeamPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Team Details | Avolve',
  description: 'View team details, members, and superpuzzle contributions',
};

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <div className="container py-8">
      <TeamDetails teamId={params.id} />
    </div>
  );
}
