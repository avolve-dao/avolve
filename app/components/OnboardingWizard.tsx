"use client";
import React, { useState, useEffect } from "react";
import Tooltip from "@/components/Tooltip";

const STEPS = [
  { key: "profile", label: "Profile" },
  { key: "interests", label: "Interests" },
  { key: "group", label: "Join Group" },
  { key: "explore", label: "Explore" },
  { key: "celebrate", label: "Celebrate" },
];

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
              idx <= currentStep
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-400 border-gray-300"
            } transition-all duration-300`}
            aria-current={idx === currentStep ? "step" : undefined}
          >
            {idx + 1}
          </div>
          {idx < STEPS.length - 1 && (
            <div className="w-8 h-1 bg-gray-300 rounded" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ProfileStep({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Update profile on backend
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile. Try again.");
        setLoading(false);
        return;
      }
      // Mark onboarding step complete
      await fetch("/api/onboarding/update-step", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "profile" }),
      });
      setLoading(false);
      onNext();
    } catch (err) {
      setError("Unexpected error. Please try again or contact support if the issue persists.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        Welcome! Let's start your journey
        <Tooltip label="Your onboarding starts by adding your name so we can personalize your experience.">{null}</Tooltip>
      </h2>
      <label className="block">
        <span className="text-gray-700 flex items-center gap-1">
          Your Name
          <Tooltip label="This will be shown on your profile and in the community. You can change it later.">{null}</Tooltip>
        </span>
        <input
          className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
          aria-label="Name"
          autoFocus
          disabled={loading}
        />
      </label>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : "Next"}
      </button>
    </form>
  );
}

function InterestsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ALL_INTERESTS = ["Tech", "Business", "Art", "Wellness", "Science", "Society"];

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length < 1) {
      setError("Pick at least one interest to continue. If you need help, hover the ? icon.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Update interests on backend
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update interests. Try again or contact support.");
        setLoading(false);
        return;
      }
      // Mark onboarding step complete
      await fetch("/api/onboarding/update-step", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "interests" }),
      });
      setLoading(false);
      onNext();
    } catch (err) {
      setError("Unexpected error. Please try again or contact support if the issue persists.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        What are you interested in?
        <Tooltip label="Select as many interests as you like. We'll use these to personalize your experience.">{null}</Tooltip>
      </h2>
      <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Interests">
        {ALL_INTERESTS.map(interest => (
          <button
            key={interest}
            type="button"
            className={`px-4 py-2 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              interests.includes(interest)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            onClick={() => toggleInterest(interest)}
            aria-pressed={interests.includes(interest)}
            aria-label={
              interests.includes(interest)
                ? `Remove ${interest} from your interests`
                : `Add ${interest} to your interests`
            }
            disabled={loading}
          >
            {interest}
          </button>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
          disabled={loading}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}

function GroupStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const GROUPS = ["Growth", "Makers", "Leaders", "Dreamers"];
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError("Please select a group to continue. Hover the ? icon if you need help.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Update group on backend
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: selected }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update group. Try again or contact support.");
        setLoading(false);
        return;
      }
      // Mark onboarding step complete
      await fetch("/api/onboarding/update-step", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "group" }),
      });
      setLoading(false);
      onNext();
    } catch (err) {
      setError("Unexpected error. Please try again or contact support if the issue persists.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        Join a group
        <Tooltip label="Pick a group that matches your vibe. You can switch later if you want.">{null}</Tooltip>
      </h2>
      <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Groups">
        {GROUPS.map(group => (
          <button
            key={group}
            type="button"
            className={`px-4 py-2 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              selected === group
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            onClick={() => setSelected(group)}
            aria-pressed={selected === group}
            aria-label={
              selected === group
                ? `Selected group: ${group}`
                : `Select group: ${group}`
            }
            disabled={loading}
          >
            {group}
          </button>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
          disabled={loading}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}

function ExploreStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Mark onboarding step complete
      await fetch("/api/onboarding/update-step", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "explore" }),
      });
      setLoading(false);
      onNext();
    } catch (err) {
      setError("Unexpected error. Please try again or contact support if the issue persists.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        Explore Avolve
        <Tooltip label="Take a moment to look around and get familiar with the platform. You can always revisit onboarding from your profile menu.">{null}</Tooltip>
      </h2>
      <p className="text-gray-600 mb-2">
        Discover features, connect with peers, and unlock your full potential!
      </p>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
          disabled={loading}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Finishing..." : "Finish Onboarding"}
        </button>
      </div>
    </form>
  );
}

// Celebration Badge SVG (Avolve Star)
const CelebrationBadge = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
    <circle cx="48" cy="48" r="48" fill="#FDE68A"/>
    <path d="M48 18L54.4721 37.5279L75 42L54.4721 46.4721L48 66L41.5279 46.4721L21 42L41.5279 37.5279L48 18Z" fill="#F59E42"/>
    <circle cx="48" cy="48" r="8" fill="#fff"/>
  </svg>
);

function MiniCelebrationToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-8 right-8 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
      <span className="text-xl">✨</span>
      <span>{message}</span>
    </div>
  );
}

function CelebrateStep() {
  useEffect(() => {
    // Confetti or animation on final step
    if (typeof window !== "undefined") {
      import("canvas-confetti").then(confetti => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 },
        });
      });
    }
  }, []);
  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <CelebrationBadge />
      <h2 className="text-3xl font-bold mb-2">🎉 You made it!</h2>
      <p className="text-lg">Welcome to Avolve. Your journey begins now. We’re excited to see what you’ll accomplish!</p>
      <div className="mt-8 animate-bounce">
        <span className="text-5xl">🚀</span>
      </div>
      <a
        href="/authenticated/dashboard"
        className="inline-block mt-6 py-2 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleStepComplete = (msg: string, nextStep: number) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setStep(nextStep);
    }, 900); // show toast briefly before next step
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Stepper currentStep={step} />
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        {step === 0 && <ProfileStep onNext={() => handleStepComplete("Profile Complete! 🎉", 1)} />}
        {step === 1 && <InterestsStep onNext={() => handleStepComplete("Interests Saved! 🌟", 2)} onBack={() => setStep(0)} />}
        {step === 2 && <GroupStep onNext={() => handleStepComplete("Group Joined! 🏅", 3)} onBack={() => setStep(1)} />}
        {step === 3 && <ExploreStep onNext={() => handleStepComplete("Exploration Complete! 🚀", 4)} onBack={() => setStep(2)} />}
        {step === 4 && <CelebrateStep />}
      </div>
      {showToast && <MiniCelebrationToast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
}
