import React from 'react';
import TeamDetails from '@/components/Teams/TeamDetails';
import { Metadata } from 'next';

type TeamPageProps = {
  params: Promise<{ id: string; }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: 'Team Details | Avolve',
  description: 'View team details, members, and superpuzzle contributions',
};

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container py-8">
      <TeamDetails teamId={resolvedParams.id} />
    </div>
  );
}
