'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import SuperpuzzleDetails from '@/components/Superpuzzles/SuperpuzzleDetails';

// Removed server component metadata
// The metadata will be handled by the layout file

export default function SuperpuzzlePage() {
  // Use client-side hooks to get params
  const params = useParams();
  const superpuzzleId = params.id as string;
  
  return (
    <div className="container py-8">
      <SuperpuzzleDetails superpuzzleId={superpuzzleId} />
    </div>
  );
}
