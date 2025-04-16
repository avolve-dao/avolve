import React from 'react';

export function OnboardingBanner({ userName, onStart }: { userName: string; onStart: () => void }) {
  return (
    <div className="onboarding-banner bg-gradient-to-r from-amber-300 to-fuchsia-400 rounded-lg shadow-lg p-6 flex flex-col items-center animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
      <p className="mb-4 text-lg">Ready to begin your Superachiever journey? Start your Success Puzzle and unlock your next level!</p>
      <button
        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded transition"
        onClick={onStart}
      >
        Start My Journey
      </button>
    </div>
  );
}
