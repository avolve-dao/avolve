"use client";
import { useEffect, useState } from "react";

const TOUR_STEPS = [
  {
    title: "Welcome to Your Dashboard!",
    content: "This is your central hub for tracking progress, joining groups, and celebrating achievements.",
  },
  {
    title: "Peer Recognition",
    content: "Thank a peer or nominate someone for recognition using the button at the top right.",
  },
  {
    title: "Analytics & Insights",
    content: "See your recognitions, onboarding progress, and more in the analytics widgets.",
  },
  {
    title: "Need Help?",
    content: "Look for the ? icons throughout the dashboard for tooltips and guidance.",
  },
];

export default function DashboardTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show for first-time users (localStorage flag)
    if (typeof window !== "undefined" && !localStorage.getItem("dashboardTourDone")) {
      setShow(true);
    }
  }, []);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setShow(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboardTourDone", "1");
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center animate-fade-in">
        <h2 className="text-xl font-bold mb-2">{TOUR_STEPS[step].title}</h2>
        <p className="mb-6 text-gray-700">{TOUR_STEPS[step].content}</p>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleNext}
        >
          {step < TOUR_STEPS.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
}
