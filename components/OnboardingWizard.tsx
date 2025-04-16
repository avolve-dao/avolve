import { useState, useEffect } from 'react';
import FeedbackWidget from './FeedbackWidget';
import Confetti from 'react-confetti';
import { useRealtimeCelebration } from '../hooks/useRealtimeCelebration';

const steps = [
  {
    title: 'Welcome to Avolve!',
    content: 'Let’s get you started on your transformation journey.',
  },
  {
    title: 'Choose Your Journey',
    content: 'Select your focus: Superachiever, Superachievers, or Supercivilization.',
    options: ['Superachiever', 'Superachievers', 'Supercivilization'],
  },
  {
    title: 'Create Your Genius ID',
    content: 'Pick an avatar and set your unique Genius ID.',
  },
  {
    title: 'Set Your First Goal',
    content: 'What’s your first personal or business goal?',
  },
  {
    title: 'Tour Key Features',
    content: 'See how Avolve helps you grow and co-create.',
  },
  {
    title: 'Celebrate!',
    content: 'You’ve completed onboarding! Claim your first badge.',
  },
];

// Helper: Randomly assign onboarding variant (A/B testing)
function getOnboardingVariant() {
  if (typeof window === 'undefined') return 'A';
  let variant = window.localStorage.getItem('onboarding_variant');
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    window.localStorage.setItem('onboarding_variant', variant);
  }
  return variant;
}

// Helper: Store journey selection in localStorage (replace with Supabase update in production)
function setUserJourney(journey: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('user_journey', journey);
  }
}

// Helper: Simulate badge minting (replace with Supabase insert in production)
function mintBadge(journey: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('onboarding_badge', `${journey}_first_steps`);
  }
}

export default function OnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [journey, setJourney] = useState<string | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const onboardingVariant = getOnboardingVariant();

  // TODO: Replace with actual user ID from auth context/session
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;

  // Celebrate in real-time when user joins a team during onboarding
  useRealtimeCelebration('team_memberships', payload => {
    if (payload.new.user_id === userId) {
      setShowConfetti(true);
      // toast.push('You joined a team! 🎉', { variant: 'success' });
    }
  });

  // Handle journey selection
  const handleJourneySelect = (selected: string) => {
    setJourney(selected);
    setUserJourney(selected);
    setStep(s => Math.min(s + 1, steps.length - 1));
  };

  // On finish, mint badge and celebrate
  const finish = () => {
    if (journey) {
      mintBadge(journey);
      setBadge(`${journey}_first_steps`);
    }
    setShowConfetti(true);
    // toast.push('Welcome to Avolve, Superachiever!', { variant: 'success' });
    if (onComplete) onComplete();
    // Optional: Play celebration sound
    // new Audio('/sounds/celebrate.mp3').play();
  };

  // On mount, load badge if exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const badge = window.localStorage.getItem('onboarding_badge');
      if (badge) setBadge(badge);
      const storedJourney = window.localStorage.getItem('user_journey');
      if (storedJourney) setJourney(storedJourney);
    }
  }, []);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // Personalize content based on journey and A/B variant
  let personalizedSteps = [...steps];
  if (journey) {
    personalizedSteps = personalizedSteps.map(step => {
      if (step.title === 'Welcome to Avolve!') {
        return { ...step, content: `Welcome, future ${journey}! Let’s get you started on your ${journey} journey.` };
      }
      if (step.title === 'Celebrate!') {
        return { ...step, content: `You’ve completed onboarding as a ${journey}! Claim your first badge below.` };
      }
      return step;
    });
  }
  if (onboardingVariant === 'B' && personalizedSteps[2]) {
    personalizedSteps[2].content += ' (B Variant: Try our new avatar picker!)';
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md animate-fade-in">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      <h2 className="text-xl font-bold mb-2">{personalizedSteps[step].title}</h2>
      <div className="mb-4">{personalizedSteps[step].content}</div>
      {personalizedSteps[step].options && (
        <div className="flex gap-2 mb-4">
          {personalizedSteps[step].options.map(opt => (
            <button key={opt} className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-300" onClick={() => handleJourneySelect(opt)}>{opt}</button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        {step > 0 && <button onClick={prev} className="px-4 py-2 rounded bg-gray-200">Back</button>}
        {step < personalizedSteps.length - 1 && <button onClick={next} className="px-4 py-2 rounded bg-blue-600 text-white">Next</button>}
        {step === personalizedSteps.length - 1 && <button onClick={finish} className="px-4 py-2 rounded bg-green-600 text-white">Finish</button>}
      </div>
      {step > 0 && !feedbackGiven && (
        <div className="mt-6">
          <FeedbackWidget context={`onboarding_step_${step}`} />
          <button onClick={() => setFeedbackGiven(true)} className="text-xs text-blue-500 mt-2">Skip Feedback</button>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">Step {step + 1} of {personalizedSteps.length}</div>
      {/* Show badge on completion */}
      {step === personalizedSteps.length - 1 && badge && (
        <div className="mt-6 flex flex-col items-center">
          <span className="text-2xl">🏅</span>
          <div className="text-sm mt-1">Badge: {badge.replace('_', ' ').replace('first steps', 'First Steps')}</div>
        </div>
      )}
      {/* Show onboarding variant for A/B testing */}
      <div className="mt-2 text-xs text-gray-300">Onboarding Variant: {onboardingVariant}</div>
    </div>
  );
}
