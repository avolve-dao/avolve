"use client";
import React, { useState, useEffect } from "react";

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
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2">Welcome! Let's start your journey 🚀</h2>
      <label className="block">
        <span className="text-gray-700">Your Name</span>
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
      setError("Pick at least one interest to continue.");
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
        setError(data.error || "Failed to update interests. Try again.");
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
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2">What are you interested in?</h2>
      <div className="flex flex-wrap gap-2">
        {ALL_INTERESTS.map(interest => (
          <button
            type="button"
            key={interest}
            className={`px-3 py-1 rounded border ${
              interests.includes(interest)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            onClick={() => toggleInterest(interest)}
            aria-pressed={interests.includes(interest)}
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
      setError("Please select a group to continue.");
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
        setError(data.error || "Failed to join group. Try again.");
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
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2">Find your tribe</h2>
      <div className="flex flex-wrap gap-2">
        {GROUPS.map(group => (
          <button
            type="button"
            key={group}
            className={`px-3 py-1 rounded border ${
              selected === group
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
            onClick={() => setSelected(group)}
            aria-pressed={selected === group}
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
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
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-2">Explore Avolve</h2>
      <p className="mb-4">Check out some of the most popular features and communities. You can always return here later!</p>
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
          type="button"
          onClick={handleNext}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Stepper currentStep={step} />
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        {step === 0 && <ProfileStep onNext={() => setStep(1)} />}
        {step === 1 && <InterestsStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <GroupStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <ExploreStep onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <CelebrateStep />}
      </div>
    </div>
  );
}
