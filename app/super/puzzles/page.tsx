import React from 'react';
import SuperpuzzlesList from '@/components/Superpuzzles/SuperpuzzlesList';

export const metadata = {
  title: 'Superpuzzles | Avolve',
  description: 'Collaborate on superpuzzles with your team to earn SCQ tokens and boost community health',
};

export default function SuperpuzzlesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Superpuzzles</h1>
      <p className="text-slate-600 mb-8">
        Superpuzzles are collaborative projects that teams can contribute to, earning SCQ tokens upon completion.
        Each day of the week features different superpuzzles aligned with that day's token.
      </p>
      
      <SuperpuzzlesList showTodayOnly={false} showContributeButton={true} />
    </div>
  );
}
