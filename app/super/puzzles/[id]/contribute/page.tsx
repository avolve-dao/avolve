'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ContributeForm } from '@/components/Superpuzzles/ContributeForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ContributePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const superpuzzleId = params.id as string;
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No team selected. Please select a team to contribute with.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Contribute to Superpuzzle</h1>
      <p className="text-slate-600 mb-8">
        Contribute points to help your team complete this superpuzzle. 
        When completed, all team members will receive SCQ tokens and boost their Community Health metrics.
      </p>
      
      <ContributeForm puzzleId={superpuzzleId} />
    </div>
  );
}
