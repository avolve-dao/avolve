import React from 'react';
import SuperpuzzlesList from '@/components/Superpuzzles/SuperpuzzlesList';

export const metadata = {
  title: "Today's Superpuzzles | Avolve",
  description: "View and contribute to today's featured superpuzzles",
};

export default function TodaySuperpuzzlesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Today's Superpuzzles</h1>
      <p className="text-slate-600 mb-8">
        Each day of the week features different superpuzzles aligned with that day's token.
        Contribute with your team to earn SCQ tokens and boost community health metrics.
      </p>
      
      <SuperpuzzlesList showTodayOnly={true} showContributeButton={true} />
    </div>
  );
}
