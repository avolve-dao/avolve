"use client";
import React, { useState, useTransition, useEffect } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";

// Native window size hook replacement
function useWindowSize() {
  const isClient = typeof window === 'object';
  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }
  const [windowSize, setWindowSize] = React.useState(getSize);
  useEffect(() => {
    if (!isClient) return;
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);
  return windowSize;
}

const CHECKLIST = [
  { key: 'profile', label: 'Complete Profile' },
  { key: 'first-claim', label: 'Claim Your First Token' },
  { key: 'join-group', label: 'Join a Superachievers Group' },
  { key: 'explore', label: 'Explore Success Puzzles' },
  { key: 'celebrate', label: 'Celebrate Your First Milestone!' },
];

export function OnboardingChecklistClient({ initialCompleted }: { initialCompleted: string[] }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const { width, height } = useWindowSize();

  async function handleAction(key: string) {
    startTransition(async () => {
      const res = await fetch('/api/onboarding/update-step', {
        method: 'PATCH',
        body: JSON.stringify({ step: key }),
      });
      if (res.ok) {
        const { completedSteps, onboardingDone } = await res.json();
        setCompleted(completedSteps);
        if (onboardingDone) {
          setCelebrate(true);
          toast.success("🎉 Onboarding Complete! Welcome to your Superachiever journey!");
          setTimeout(() => {
            setShowNext(true);
          }, 1800);
        }
      }
    });
  }

  return (
    <div className="onboarding-checklist bg-white rounded-lg shadow p-4 mt-6 relative">
      <h2 className="text-xl font-semibold mb-2">Your Onboarding Journey</h2>
      <ul className="space-y-2">
        {CHECKLIST.map(item => (
          <li key={item.key} className="flex items-center">
            <span className={`inline-block w-5 h-5 mr-2 rounded-full border-2 ${completed.includes(item.key) ? 'bg-green-400 border-green-400' : 'border-gray-300'}`}></span>
            <span className={completed.includes(item.key) ? 'line-through text-gray-400' : ''}>{item.label}</span>
            {!completed.includes(item.key) && (
              <button
                className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                onClick={() => handleAction(item.key)}
                disabled={isPending}
              >
                Do Now
              </button>
            )}
          </li>
        ))}
      </ul>
      {celebrate && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <Confetti width={width} height={height} numberOfPieces={400} recycle={false} />
          <span className="text-4xl font-bold mt-8 animate-bounce">🎉</span>
        </div>
      )}
      {showNext && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="mb-4 text-lg text-center">You're ready to begin your Superachiever journey.<br />What's next?</p>
            <a href="/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-semibold transition">Go to Dashboard</a>
          </div>
        </div>
      )}
    </div>
  );
}
