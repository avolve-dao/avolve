import { useState, useEffect } from 'react';
import FeedbackWidget from './FeedbackWidget';
import Confetti from 'react-confetti';
import { useRealtimeCelebration } from '../hooks/useRealtimeCelebration';
import { useOnboarding } from './onboarding/OnboardingProvider';
import { createClient } from '@/lib/supabase/client';

const steps = [
  {
    title: 'Welcome to Avolve!',
    content: 'Let’s get you started on your transformation journey.',
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
    title: 'Make Your First Post',
    content: 'Share your thoughts and earn your first badge.',
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

export default function OnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [journey, setJourney] = useState<string | null>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const onboardingVariant = getOnboardingVariant();

  // Supabase client for direct DB updates
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Use onboarding context for step and completion
  useOnboarding();

  // Authenticated user ID from Supabase
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    }
    fetchUser();
  }, [supabase]);

  // Celebrate in real-time when user joins a team during onboarding
  useRealtimeCelebration('team_memberships', payload => {
    if (payload.new.user_id === userId) {
      setShowConfetti(true);
    }
  });

  // Load journey and badge from Supabase on mount
  useEffect(() => {
    async function fetchJourneyAndBadge() {
      if (!userId) return;
      const { data } = await supabase
        .from('user_onboarding')
        .select('journey,badge')
        .eq('user_id', userId)
        .single();
      if (data) {
        if (data.journey) setJourney(data.journey);
        if (data.badge) setBadge(data.badge);
      }
    }
    fetchJourneyAndBadge();
  }, [userId, supabase]);

  // Handle journey selection and persist to Supabase
  const handleJourneySelect = async (selected: string) => {
    setJourney(selected);
    setStep(s => Math.min(s + 1, steps.length - 1));
    if (userId) {
      await supabase.from('user_onboarding').upsert({
        user_id: userId,
        journey: selected,
      });
    }
  };

  // On finish, mint badge, assign token, and celebrate
  const finish = async () => {
    if (journey && userId) {
      const badgeValue = `${journey}_first_steps`;
      setBadge(badgeValue);
      setShowConfetti(true);
      // Save badge and mark onboarding complete
      await supabase.from('user_onboarding').upsert({
        user_id: userId,
        badge: badgeValue,
        is_complete: true,
        current_step: steps.length,
        total_steps: steps.length,
        journey,
      });
      // Assign token/role (example: insert into user_tokens)
      await supabase.from('user_tokens').upsert({
        user_id: userId,
        token: journey,
        source: 'onboarding',
        awarded_at: new Date().toISOString(),
      });
    }
    setShowConfetti(true);
    if (onComplete) onComplete();
  };

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // Personalize content based on journey and A/B variant
  let personalizedSteps = [...steps];
  if (journey) {
    personalizedSteps = personalizedSteps.map(step => {
      if (step.title === 'Welcome to Avolve!') {
        return { ...step, content: `Welcome, future ${journey}! Let’s get you started on your ${journey} journey.` };
      }
      if (step.title === 'Make Your First Post') {
        return { ...step, content: `You’re almost there, ${journey}! Share your thoughts and earn your first badge.` };
      }
      return step;
    });
  }

  // --- MVP LAUNCH POLISH: ONBOARDING ---
  // Only show available onboarding steps and rewards. Hide or gray out future badges/achievements.

  const availableBadges = [
    'first_steps',
    // add other MVP-available badges here
  ];

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md animate-fade-in md:p-8 lg:p-12">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      <h2 className="text-xl font-bold mb-2" aria-label="Onboarding step title">{personalizedSteps[step].title}</h2>
      <div className="mb-4" aria-label="Onboarding step content">{personalizedSteps[step].content}</div>
      {step === 1 && (
        <div className="flex gap-2 mb-4 md:gap-4 lg:gap-6">
          <button key="Genius" className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => handleJourneySelect('Genius')} aria-label="Select Genius journey">Genius</button>
          <button key="Superachiever" className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => handleJourneySelect('Superachiever')} aria-label="Select Superachiever journey">Superachiever</button>
          <button key="Supercivilization" className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500" onClick={() => handleJourneySelect('Supercivilization')} aria-label="Select Supercivilization journey">Supercivilization</button>
        </div>
      )}
      <div className="flex gap-2 md:gap-4 lg:gap-6">
        {step > 0 && <button onClick={prev} className="px-4 py-2 rounded bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-500" aria-label="Go back to previous step">Back</button>}
        {step < personalizedSteps.length - 1 && <button onClick={next} className="px-4 py-2 rounded bg-blue-600 text-white focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Go to next step">Next</button>}
        {step === personalizedSteps.length - 1 && <button onClick={finish} className="px-4 py-2 rounded bg-green-600 text-white focus-visible:ring-2 focus-visible:ring-green-500" aria-label="Finish onboarding">Finish</button>}
      </div>
      {step > 0 && !feedbackGiven && (
        <div className="mt-6">
          <FeedbackWidget context={`onboarding_step_${step}`} aria-label="Provide feedback for this step" />
          <button onClick={() => setFeedbackGiven(true)} className="text-xs text-blue-500 mt-2 focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Skip feedback">Skip Feedback</button>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400" aria-label="Current step and total steps">Step {step + 1} of {personalizedSteps.length}</div>
      {/* Show badge on completion */}
      {step === personalizedSteps.length - 1 && badge && availableBadges.includes(badge) && (
        <div className="mt-6 flex flex-col items-center">
          <span className="text-2xl" aria-label="Badge icon">🏅</span>
          <div className="text-sm mt-1" aria-label="Badge name">Badge: {badge.replace('_', ' ').replace('first steps', 'First Steps')}</div>
        </div>
      )}
      {step === personalizedSteps.length - 1 && badge && !availableBadges.includes(badge) && (
        <div className="mt-6 flex flex-col items-center opacity-50">
          <span className="text-2xl" aria-label="Badge icon">🏅</span>
          <div className="text-sm mt-1" aria-label="Badge name">Badge: Coming Soon</div>
        </div>
      )}
      {/* Progress bar */}
      <div className="mt-2 w-full bg-gray-200 h-2 rounded" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={personalizedSteps.length}>
        <div className={`bg-blue-600 h-2 rounded ${step === 0 ? 'w-1/4' : step === 1 ? 'w-1/2' : step === 2 ? 'w-3/4' : 'w-full'}`}></div>
      </div>
    </div>
  );
}
