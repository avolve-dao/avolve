import React from 'react';
import Link from 'next/link';

export default function ProfileSetupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-gradient-to-b from-primary/20 to-background">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-md p-8 border border-border">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Set Up Your Profile</h1>
          <p className="text-muted-foreground">Tell us a bit about yourself to personalize your experience.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1">Display Name</label>
            <input 
              id="displayName" 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground" 
              placeholder="How you'd like to be known in Avolve"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">Bio</label>
            <textarea 
              id="bio" 
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground" 
              placeholder="Share a bit about your goals and aspirations"
            ></textarea>
            <p className="mt-1 text-xs text-muted-foreground">Maximum 200 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Primary Focus</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-border rounded-md p-3">
                <input 
                  type="radio" 
                  id="individual" 
                  name="focus" 
                  value="individual" 
                  className="hidden"
                />
                <label htmlFor="individual" className="cursor-pointer">
                  <span className="block text-sm font-medium text-foreground mb-1">Individual Growth</span>
                  <span className="block text-xs text-muted-foreground">Personal success and superpowers</span>
                </label>
              </div>
              <div className="border border-border rounded-md p-3">
                <input 
                  type="radio" 
                  id="collective" 
                  name="focus" 
                  value="collective" 
                  className="hidden"
                />
                <label htmlFor="collective" className="cursor-pointer">
                  <span className="block text-sm font-medium text-foreground mb-1">Collective Impact</span>
                  <span className="block text-xs text-muted-foreground">Team achievements</span>
                </label>
              </div>
              <div className="border border-border rounded-md p-3">
                <input 
                  type="radio" 
                  id="ecosystem" 
                  name="focus" 
                  value="ecosystem" 
                  className="hidden"
                />
                <label htmlFor="ecosystem" className="cursor-pointer">
                  <span className="block text-sm font-medium text-foreground mb-1">Ecosystem Genesis</span>
                  <span className="block text-xs text-muted-foreground">Supercivilization building</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Link 
            href="/onboarding" 
            className="flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-transparent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center"
          >
            Back
          </Link>
          <Link 
            href="/onboarding/interests" 
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center flex-1"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
