import React from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  // This page would have logic to determine A/B test variant
  // For now, showing a simple welcome flow
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-gradient-to-b from-primary/20 to-background">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-md p-8 border border-border">
        <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Avolve</h1>
        <p className="text-muted-foreground mb-8 text-center">You're embarking on a journey of personal and collective transformation.</p>
        
        <div className="bg-primary/10 border border-primary/20 rounded-md p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold mb-2">What to Expect</h2>
          <p className="text-sm text-muted-foreground mb-4">Over the next few minutes, we'll guide you through setting up your profile and choosing your transformation path.</p>
          <p className="text-xs text-muted-foreground">Your choices will help us personalize your Avolve experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-lg font-medium text-primary mb-2">Individual Growth</h3>
            <p className="text-sm text-muted-foreground">Focus on personal success and develop your supermind superpowers.</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-lg font-medium text-primary mb-2">Collective Impact</h3>
            <p className="text-sm text-muted-foreground">Join forces with others for superhuman advancements.</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-lg font-medium text-primary mb-2">Ecosystem Genesis</h3>
            <p className="text-sm text-muted-foreground">Contribute to building a supercivilization.</p>
          </div>
        </div>
        
        <Link 
          href="/onboarding/profile" 
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center"
        >
          Begin Your Journey
        </Link>
      </div>
    </div>
  );
}
