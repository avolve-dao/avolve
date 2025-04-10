import React from 'react';
import TeamDetails from '@/components/Teams/TeamDetails';
import { Metadata } from 'next';

type TeamPageProps = {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
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
