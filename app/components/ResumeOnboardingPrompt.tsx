"use client";
import React, { useEffect, useState } from "react";

export default function ResumeOnboardingPrompt() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/onboarding/progress");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.completedSteps && !data.onboardingDone) {
          setStep(data.completedSteps[data.completedSteps.length - 1] || "profile");
          setShow(true);
        }
      } catch {}
    }
    checkOnboarding();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-lg shadow-lg p-4 flex items-center gap-4 z-50 animate-bounce-in">
      <span>Resume onboarding where you left off?</span>
      <a
        href="/onboarding"
        className="py-2 px-4 bg-white text-blue-600 rounded hover:bg-blue-100 font-semibold transition"
      >
        Resume
      </a>
    </div>
  );
}
