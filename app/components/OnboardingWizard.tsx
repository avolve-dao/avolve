'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';
import { InvitationCodeInput } from '@/components/onboarding/InvitationCodeInput';
import { RequestInviteForm } from '@/components/onboarding/RequestInviteForm';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, ChevronRight, ArrowRight, Star, Sparkles } from 'lucide-react';

// Streamlined steps for faster onboarding
const STEPS = [
  { key: 'profile', label: 'Identity' },
  { key: 'intention', label: 'Intention' },
  { key: 'unlock', label: 'First Unlock' },
  { key: 'celebrate', label: 'Welcome' },
];

function Stepper({ currentStep }: { currentStep: number }) {
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">
          Step {currentStep + 1} of {STEPS.length}
        </span>
        <span className="text-sm font-medium text-gray-500">{STEPS[currentStep].label}</span>
      </div>

      <Progress value={progressPercentage} className="h-2 mb-4" />

      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.key}>
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-600'
                  : 'bg-gray-100 text-gray-400 border-gray-300'
              } transition-all duration-300`}
              aria-current={idx === currentStep ? 'step' : undefined}
            >
              {idx < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                idx + 1
              )}
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-1 rounded ${idx < currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ProfileStep({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Fetch user profile if it exists
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, bio')
          .eq('id', user.id)
          .single();
          
        if (data && !error) {
          setName(data.full_name || '');
          setBio(data.bio || '');
        }
      }
    };
    
    fetchProfile();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('You must be logged in to continue.');
        setLoading(false);
        return;
      }
      
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name,
          bio: bio,
          updated_at: new Date().toISOString()
        });
        
      if (updateError) {
        setError(updateError.message || 'Failed to update profile. Try again.');
        setLoading(false);
        return;
      }
      
      // Mark onboarding step complete
      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          completed_steps: ['profile'],
          last_step: 'profile',
          updated_at: new Date().toISOString()
        });
        
      setLoading(false);
      onNext();
    } catch (err) {
      setError('Unexpected error. Please try again or contact support if the issue persists.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        Welcome to Avolve!
        <Tooltip label="Let's start your journey by setting up your identity.">
          {null}
        </Tooltip>
      </h2>
      <p className="text-gray-600 mb-4">
        Tell us who you are so we can personalize your experience.
      </p>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
          Short Bio
          <Tooltip label="A brief description about yourself (optional)">
            {null}
          </Tooltip>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Tell us a bit about yourself (optional)"
          rows={3}
        />
      </div>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

function IntentionStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient<Database>();
  
  const intentions = [
    { id: 'personal_growth', label: 'Personal Growth', description: 'Develop skills and knowledge' },
    { id: 'networking', label: 'Networking', description: 'Connect with like-minded individuals' },
    { id: 'contribution', label: 'Contribution', description: 'Give back to the community' },
    { id: 'innovation', label: 'Innovation', description: 'Create new solutions' },
    { id: 'leadership', label: 'Leadership', description: 'Guide and inspire others' },
    { id: 'learning', label: 'Learning', description: 'Acquire new perspectives' },
  ];

  const toggleIntention = (intentionId: string) => {
    setSelectedIntentions(prev => 
      prev.includes(intentionId) 
        ? prev.filter(id => id !== intentionId) 
        : [...prev, intentionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIntentions.length === 0) {
      setError('Please select at least one intention to continue.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('You must be logged in to continue.');
        setLoading(false);
        return;
      }
      
      // Save user intentions
      const { error: intentionError } = await supabase
        .from('user_intentions')
        .upsert({
          user_id: user.id,
          intentions: selectedIntentions,
          updated_at: new Date().toISOString()
        });
        
      if (intentionError) {
        setError(intentionError.message || 'Failed to save intentions. Try again.');
        setLoading(false);
        return;
      }
      
      // Get current onboarding progress
      const { data: onboardingData } = await supabase
        .from('user_onboarding')
        .select('completed_steps')
        .eq('user_id', user.id)
        .single();
        
      // Update onboarding progress
      const completedSteps = onboardingData?.completed_steps || [];
      if (!completedSteps.includes('intention')) {
        completedSteps.push('intention');
      }
      
      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          completed_steps: completedSteps,
          last_step: 'intention',
          updated_at: new Date().toISOString()
        });
        
      setLoading(false);
      onNext();
    } catch (err) {
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2">What brings you to Avolve?</h2>
      <p className="text-gray-600 mb-4">
        Select your intentions to help us tailor your experience.
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {intentions.map(intention => (
          <div
            key={intention.id}
            onClick={() => toggleIntention(intention.id)}
            className={`
              p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${selectedIntentions.includes(intention.id) 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'}
            `}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{intention.label}</h3>
              {selectedIntentions.includes(intention.id) && (
                <CheckCircle className="h-4 w-4 text-indigo-600" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{intention.description}</p>
          </div>
        ))}
      </div>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function UnlockStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const supabase = createClientComponentClient<Database>();
  
  const handleUnlock = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('You must be logged in to continue.');
        setLoading(false);
        return;
      }
      
      // Unlock the first feature for the user
      const { error: unlockError } = await supabase
        .from('user_features')
        .upsert({
          user_id: user.id,
          feature_key: 'supercivilization_feed',
          enabled: true,
          unlocked_at: new Date().toISOString()
        });
        
      if (unlockError) {
        setError(unlockError.message || 'Failed to unlock feature. Try again.');
        setLoading(false);
        return;
      }
      
      // Get current onboarding progress
      const { data: onboardingData } = await supabase
        .from('user_onboarding')
        .select('completed_steps')
        .eq('user_id', user.id)
        .single();
        
      // Update onboarding progress
      const completedSteps = onboardingData?.completed_steps || [];
      if (!completedSteps.includes('unlock')) {
        completedSteps.push('unlock');
      }
      
      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          completed_steps: completedSteps,
          last_step: 'unlock',
          updated_at: new Date().toISOString()
        });
      
      setUnlocked(true);
      setTimeout(() => {
        setLoading(false);
        onNext();
      }, 1500);
    } catch (err) {
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Unlock Your First Feature</h2>
      <p className="text-gray-600 mb-4">
        You're ready to unlock your first feature: the Supercivilization Feed!
      </p>
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20">
          <div className="absolute top-4 right-4 transform rotate-12">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-indigo-800 mb-2">Supercivilization Feed</h3>
        <p className="text-gray-700 mb-4">
          Connect with extraordinary individuals and engage with thought-provoking content.
        </p>
        
        {unlocked ? (
          <div className="flex items-center justify-center space-x-2 text-green-600 font-medium">
            <CheckCircle className="h-5 w-5" />
            <span>Unlocked!</span>
          </div>
        ) : (
          <Button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                Unlock Now
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      {!unlocked && (
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

function CelebrationBadge() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 5L35.8 20.2H52.3L39.3 30.8L44.3 46.2L30 36.5L15.7 46.2L20.7 30.8L7.7 20.2H24.2L30 5Z" fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1="15" y1="10" x2="45" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function MiniCelebrationToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        &times;
      </button>
    </div>
  );
}

function CelebrateStep() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <CelebrationBadge />
      <h2 className="text-2xl font-bold mb-2">Welcome to Avolve!</h2>
      <p className="text-gray-600">
        You're all set! Your journey with the Supercivilization begins now.
      </p>
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <h3 className="font-semibold text-indigo-800 mb-2">What's Next?</h3>
        <ul className="text-left space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <span>Explore the Supercivilization Feed</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <span>Track your personal progress</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <span>Unlock new features as you contribute</span>
          </li>
        </ul>
      </div>
      <Button
        onClick={() => router.push('/dashboard')}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
      >
        Go to Dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <p className="text-sm text-gray-500">
        Redirecting to dashboard in {countdown} seconds...
      </p>
    </div>
  );
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const supabase = createClientComponentClient<Database>();

  // Fetch user's onboarding progress
  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('completed_steps')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data?.completed_steps) {
          setCompletedSteps(data.completed_steps);

          // Set the step based on completed steps
          const completedStepKeys = data.completed_steps as string[];
          let nextStepIndex = 0;

          // Find the first incomplete step
          for (let i = 0; i < STEPS.length; i++) {
            if (!completedStepKeys.includes(STEPS[i].key)) {
              nextStepIndex = i;
              break;
            }

            // If all steps are completed, show the celebration step
            if (i === STEPS.length - 2) {
              nextStepIndex = STEPS.length - 1;
            }
          }

          setStep(nextStepIndex);
        }
      } catch (error) {
        console.error('Error fetching onboarding progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingProgress();
  }, [supabase]);

  const handleStepComplete = async (msg: string, nextStep: number, completedStep: string) => {
    setToastMsg(msg);
    setShowToast(true);

    // Update completed steps
    const updatedCompletedSteps = [...completedSteps];
    if (!updatedCompletedSteps.includes(completedStep)) {
      updatedCompletedSteps.push(completedStep);
      setCompletedSteps(updatedCompletedSteps);

      // Save progress to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase.from('user_onboarding').upsert({
            user_id: user.id,
            completed_steps: updatedCompletedSteps,
            last_step: completedStep,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error saving onboarding progress:', error);
      }
    }

    setTimeout(() => {
      setShowToast(false);
      setStep(nextStep);
    }, 900); // show toast briefly before next step
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="w-full max-w-lg text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
          <p className="mt-4 text-gray-500">Loading your onboarding experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Stepper currentStep={step} />
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        {step === 0 && (
          <ProfileStep 
            onNext={() => handleStepComplete('Identity set! 🎉', 1, 'profile')} 
          />
        )}
        {step === 1 && (
          <IntentionStep
            onNext={() => handleStepComplete('Intentions saved! 🌟', 2, 'intention')}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <UnlockStep
            onNext={() => handleStepComplete('Feature unlocked! 🚀', 3, 'unlock')}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <CelebrateStep />}
      </div>
      {showToast && <MiniCelebrationToast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
}
