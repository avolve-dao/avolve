import React from 'react';

const CHECKLIST = [
  { key: 'profile', label: 'Complete Profile' },
  { key: 'first-claim', label: 'Claim Your First Token' },
  { key: 'join-group', label: 'Join a Superachievers Group' },
  { key: 'explore', label: 'Explore Success Puzzles' },
  { key: 'celebrate', label: 'Celebrate Your First Milestone!' },
];

export function OnboardingChecklist({
  completed,
  onAction,
}: {
  completed: string[];
  onAction: (key: string) => void;
}) {
  return (
    <div className="onboarding-checklist bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-xl font-semibold mb-2">Your Onboarding Journey</h2>
      <ul className="space-y-2">
        {CHECKLIST.map(item => (
          <li key={item.key} className="flex items-center">
            <span
              className={`inline-block w-5 h-5 mr-2 rounded-full border-2 ${completed.includes(item.key) ? 'bg-green-400 border-green-400' : 'border-gray-300'}`}
            ></span>
            <span className={completed.includes(item.key) ? 'line-through text-gray-400' : ''}>
              {item.label}
            </span>
            {!completed.includes(item.key) && (
              <button
                className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                onClick={() => onAction(item.key)}
              >
                Do Now
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
