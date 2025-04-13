import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingContext } from '@/components/Onboarding/OnboardingProvider';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Welcome to Avolve',
  description: 'Start your journey to becoming a Superachiever',
};

export default function WelcomePage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Welcome to Avolve
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Your journey to becoming a Superachiever starts here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <FeatureCard 
          title="Superachiever"
          description="Your individual journey of transformation"
          gradient="from-amber-500 to-yellow-500"
          icon="/images/icons/superachiever.svg"
          tokens={['PSP', 'BSP', 'SMS']}
        />
        <FeatureCard 
          title="Superachievers"
          description="Your collective journey of transformation"
          gradient="from-slate-500 to-slate-700"
          icon="/images/icons/superachievers.svg"
          tokens={['SPD', 'SHE', 'SSA', 'SGB']}
        />
        <FeatureCard 
          title="Supercivilization"
          description="Your ecosystem journey of transformation"
          gradient="from-zinc-400 to-zinc-600"
          icon="/images/icons/supercivilization.svg"
          tokens={['GEN']}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Daily Token Claims</CardTitle>
            <CardDescription>
              Claim different tokens each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <DayTokenRow day="Sunday" token="SPD" description="Superpuzzle Developments" gradient="from-red-500 via-green-500 to-blue-500" />
              <DayTokenRow day="Monday" token="SHE" description="Superhuman Enhancements" gradient="from-rose-500 via-red-500 to-orange-500" />
              <DayTokenRow day="Tuesday" token="PSP" description="Personal Success Puzzle" gradient="from-amber-500 to-yellow-500" />
              <DayTokenRow day="Wednesday" token="SSA" description="Supersociety Advancements" gradient="from-lime-500 via-green-500 to-emerald-500" />
              <DayTokenRow day="Thursday" token="BSP" description="Business Success Puzzle" gradient="from-teal-500 to-cyan-500" />
              <DayTokenRow day="Friday" token="SGB" description="Supergenius Breakthroughs" gradient="from-sky-500 via-blue-500 to-indigo-500" />
              <DayTokenRow day="Saturday" token="SMS" description="Supermind Superpowers" gradient="from-violet-500 via-purple-500 to-fuchsia-500 to-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Feature Unlocks</CardTitle>
            <CardDescription>
              Unlock features by participating and improving metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureUnlockRow 
                feature="Teams" 
                requirement="Complete 10 challenges" 
                icon="👥"
              />
              <FeatureUnlockRow 
                feature="Governance" 
                requirement="Accumulate 100 GEN tokens" 
                icon="🏛️"
              />
              <FeatureUnlockRow 
                feature="Marketplace" 
                requirement="Complete 1 superpuzzle or achieve DAU/MAU > 0.3" 
                icon="🛒"
              />
              <FeatureUnlockRow 
                feature="Token Utility" 
                requirement="Claim tokens on their respective days" 
                icon="🪙"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <StartOnboardingButton />
    </div>
  );
}

function FeatureCard({ title, description, gradient, icon, tokens }: { 
  title: string; 
  description: string; 
  gradient: string;
  icon: string;
  tokens: string[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`}></div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="relative w-10 h-10">
            <Image
              src={icon}
              alt={title}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tokens.map(token => (
            <div key={token} className="px-2 py-1 bg-slate-100 rounded text-sm font-medium">
              {token}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DayTokenRow({ day, token, description, gradient }: {
  day: string;
  token: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-bold text-xs mr-3`}>
          {token}
        </div>
        <div>
          <p className="font-medium">{day}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureUnlockRow({ feature, requirement, icon }: {
  feature: string;
  requirement: string;
  icon: string;
}) {
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xl mr-3">
        {icon}
      </div>
      <div>
        <p className="font-medium">{feature}</p>
        <p className="text-sm text-slate-500">{requirement}</p>
      </div>
    </div>
  );
}

function StartOnboardingButton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Button 
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-6 text-lg"
        asChild
      >
        <Link href="/onboarding">
          Start Your Journey
        </Link>
      </Button>
      <p className="text-slate-500 text-sm">
        Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
