import React from 'react';
import Link from 'next/link';

export default function InterestsPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-gradient-to-b from-primary/20 to-background">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-md p-8 border border-border">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Select Your Interests</h1>
          <p className="text-muted-foreground">Help us tailor your experience by choosing topics that interest you most.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Areas of Transformation</label>
            <p className="text-xs text-muted-foreground mb-2">Select up to 5 areas you're passionate about.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="personal-growth" className="mr-2" />
                <label htmlFor="personal-growth" className="text-sm text-foreground flex-1">Personal Growth</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="leadership" className="mr-2" />
                <label htmlFor="leadership" className="text-sm text-foreground flex-1">Leadership</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="innovation" className="mr-2" />
                <label htmlFor="innovation" className="text-sm text-foreground flex-1">Innovation</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="sustainability" className="mr-2" />
                <label htmlFor="sustainability" className="text-sm text-foreground flex-1">Sustainability</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="technology" className="mr-2" />
                <label htmlFor="technology" className="text-sm text-foreground flex-1">Technology</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="community" className="mr-2" />
                <label htmlFor="community" className="text-sm text-foreground flex-1">Community Building</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="health" className="mr-2" />
                <label htmlFor="health" className="text-sm text-foreground flex-1">Health & Wellness</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="education" className="mr-2" />
                <label htmlFor="education" className="text-sm text-foreground flex-1">Education</label>
              </div>
              <div className="border border-border rounded-md p-2 flex items-center">
                <input type="checkbox" id="creativity" className="mr-2" />
                <label htmlFor="creativity" className="text-sm text-foreground flex-1">Creativity</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Preferred Learning Style</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-border rounded-md p-3">
                <input 
                  type="radio" 
                  id="visual" 
                  name="learning" 
                  value="visual" 
                  className="hidden"
                />
                <label htmlFor="visual" className="cursor-pointer">
                  <span className="block text-sm font-medium text-foreground mb-1">Visual</span>
                  <span className="block text-xs text-muted-foreground">Videos, diagrams, charts</span>
                </label>
              </div>
              <div className="border border-border rounded-md p-3">
                <input 
                  type="radio" 
                  id="auditory" 
                  name="learning" 
                  value="auditory" 
                  className="hidden"
                />
                <label htmlFor="auditory" className="cursor-pointer">
                  <span className="block text-sm font-medium text-foreground mb-1">Auditory</span>
                  <span className="block text-xs text-muted-foreground">Podcasts, discussions</span>
                </label>
              </div>
              <div className="border border-border rounded-md p-3">
                <input 
                  type="radio" 
                  id="kinesthetic" 
                  name="learning" 
                  value="kinesthetic" 
                  className="hidden"
                />
                <label htmlFor="kinesthetic" className="cursor-pointer">
                  <span className="block text-sm font-medium text-foreground mb-1">Kinesthetic</span>
                  <span className="block text-xs text-muted-foreground">Hands-on, practical</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Link 
            href="/onboarding/profile" 
            className="flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-transparent hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center"
          >
            Back
          </Link>
          <Link 
            href="/dashboard" 
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center flex-1"
          >
            Complete Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
