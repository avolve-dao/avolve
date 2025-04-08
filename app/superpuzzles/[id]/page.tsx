import React from 'react';
import SuperpuzzleDetails from '@/components/Superpuzzles/SuperpuzzleDetails';

interface SuperpuzzlePageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Superpuzzle Details | Avolve',
  description: 'View superpuzzle details and team contributions',
};

export default function SuperpuzzlePage({ params }: SuperpuzzlePageProps) {
  return (
    <div className="container py-8">
      <SuperpuzzleDetails superpuzzleId={params.id} />
    </div>
  );
}
