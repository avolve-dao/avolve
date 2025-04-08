import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Star } from 'lucide-react';
import FeatureGuard from '@/components/Features/FeatureGuard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Onboarding - Avolve',
  description: 'Complete your onboarding to unlock features',
};

export default function OnboardingPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Your Onboarding Journey</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Complete these steps to unlock features and start your transformation
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OnboardingOverview />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSetup />
        </TabsContent>

        <TabsContent value="tokens">
          <TokensIntroduction />
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengesIntroduction />
        </TabsContent>

        <TabsContent value="features">
          <FeaturesUnlocking />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OnboardingOverview() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Avolve</CardTitle>
          <CardDescription>
            Your journey to becoming a Superachiever starts here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Avolve is built around three main value pillars:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ValuePillar 
              title="Superachiever" 
              description="Your individual journey of transformation" 
              gradient="from-amber-500 to-yellow-500"
            />
            <ValuePillar 
              title="Superachievers" 
              description="Your collective journey of transformation" 
              gradient="from-slate-500 to-slate-700"
            />
            <ValuePillar 
              title="Supercivilization" 
              description="Your ecosystem journey of transformation" 
              gradient="from-zinc-400 to-zinc-600"
            />
          </div>
          <p>
            Complete your onboarding to unlock features and start earning tokens. Each step you complete will bring you closer to unlocking the full potential of the platform.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OnboardingStep 
          number={1}
          title="Complete Your Profile"
          description="Set up your profile and preferences"
          isCompleted={false}
          link="/onboarding?tab=profile"
        />
        <OnboardingStep 
          number={2}
          title="Learn About Tokens"
          description="Understand the token system and how to earn"
          isCompleted={false}
          link="/onboarding?tab=tokens"
        />
        <OnboardingStep 
          number={3}
          title="Start Challenges"
          description="Begin your first challenges to earn tokens"
          isCompleted={false}
          link="/onboarding?tab=challenges"
        />
        <OnboardingStep 
          number={4}
          title="Unlock Features"
          description="See what features you can unlock"
          isCompleted={false}
          link="/onboarding?tab=features"
        />
      </div>
    </div>
  );
}

function ProfileSetup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p>
            Your profile helps us tailor the Avolve experience to your needs and goals. Complete your profile to:
          </p>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Receive personalized challenges and recommendations</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Connect with like-minded Superachievers</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Track your progress across all value pillars</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Earn your first GEN tokens</span>
            </li>
          </ul>
          
          <div className="flex justify-center mt-6">
            <Button asChild>
              <Link href="/profile/edit">
                Complete Your Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TokensIntroduction() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token System</CardTitle>
        <CardDescription>
          Learn about the tokens that power the Avolve ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p>
            Avolve uses a hierarchical token system to reward participation and drive engagement:
          </p>
          
          <div className="space-y-4 mt-4">
            <TokenCard 
              name="GEN" 
              fullName="Supercivilization" 
              description="The top-level token representing the entire ecosystem" 
              gradient="from-zinc-400 to-zinc-600"
            />
            
            <div className="ml-8 space-y-4">
              <TokenCard 
                name="SAP" 
                fullName="Superachiever" 
                description="Tokens for your individual journey" 
                gradient="from-amber-500 to-yellow-500"
              />
              
              <div className="ml-8 space-y-2">
                <TokenCard 
                  name="PSP" 
                  fullName="Personal Success Puzzle" 
                  description="Available on Tuesdays" 
                  gradient="from-amber-500 to-yellow-500"
                  small
                />
                <TokenCard 
                  name="BSP" 
                  fullName="Business Success Puzzle" 
                  description="Available on Thursdays" 
                  gradient="from-teal-500 to-cyan-500"
                  small
                />
                <TokenCard 
                  name="SMS" 
                  fullName="Supermind Superpowers" 
                  description="Available on Saturdays" 
                  gradient="from-violet-500 via-purple-500 to-fuchsia-500"
                  small
                />
              </div>
              
              <TokenCard 
                name="SCQ" 
                fullName="Superachievers" 
                description="Tokens for your collective journey" 
                gradient="from-slate-500 to-slate-700"
              />
              
              <div className="ml-8 space-y-2">
                <TokenCard 
                  name="SPD" 
                  fullName="Superpuzzle Developments" 
                  description="Available on Sundays" 
                  gradient="from-red-500 via-green-500 to-blue-500"
                  small
                />
                <TokenCard 
                  name="SHE" 
                  fullName="Superhuman Enhancements" 
                  description="Available on Mondays" 
                  gradient="from-rose-500 via-red-500 to-orange-500"
                  small
                />
                <TokenCard 
                  name="SSA" 
                  fullName="Supersociety Advancements" 
                  description="Available on Wednesdays" 
                  gradient="from-lime-500 via-green-500 to-emerald-500"
                  small
                />
                <TokenCard 
                  name="SGB" 
                  fullName="Supergenius Breakthroughs" 
                  description="Available on Fridays" 
                  gradient="from-sky-500 via-blue-500 to-indigo-500"
                  small
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button asChild>
              <Link href="/tokens">
                View Your Tokens <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengesIntroduction() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenges</CardTitle>
        <CardDescription>
          Complete challenges to earn tokens and unlock features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p>
            Challenges are the primary way to earn tokens and progress in your Avolve journey. Each challenge is designed to help you grow in one of the three value pillars.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <ChallengeCard 
              title="Daily Claim" 
              description="Claim your daily token" 
              reward="5-10 tokens"
              difficulty="Easy"
            />
            <ChallengeCard 
              title="Profile Completion" 
              description="Complete your profile" 
              reward="25 GEN"
              difficulty="Easy"
            />
            <ChallengeCard 
              title="First Team" 
              description="Create or join a team" 
              reward="50 GEN + 25 SCQ"
              difficulty="Medium"
            />
          </div>
          
          <p className="mt-4">
            New challenges unlock as you progress through your journey. Complete challenges consistently to maximize your token earnings and unlock advanced features.
          </p>
          
          <div className="flex justify-center mt-6">
            <Button asChild>
              <Link href="/challenges">
                View All Challenges <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturesUnlocking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Unlocks</CardTitle>
        <CardDescription>
          Discover what features you can unlock through participation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p>
            Avolve features are progressively unlocked as you participate in the platform and improve your metrics. Here are the key features you can unlock:
          </p>
          
          <div className="space-y-4 mt-4">
            <FeatureUnlockCard 
              title="Teams" 
              description="Create or join teams to collaborate with other Superachievers" 
              requirement="Complete 10 challenges"
              icon="👥"
            />
            <FeatureUnlockCard 
              title="Governance" 
              description="Create petitions and vote on platform decisions" 
              requirement="Accumulate 100 GEN tokens"
              icon="🏛️"
            />
            <FeatureUnlockCard 
              title="Marketplace" 
              description="Buy, sell, and trade items with other users" 
              requirement="Complete 1 superpuzzle or achieve DAU/MAU > 0.3"
              icon="🛒"
            />
            <FeatureUnlockCard 
              title="Token Utility" 
              description="Spend tokens to unlock premium features" 
              requirement="Claim tokens on their respective days"
              icon="🪙"
            />
          </div>
          
          <div className="flex justify-center mt-6">
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ValuePillar({ title, description, gradient }: { title: string; description: string; gradient: string }) {
  return (
    <div className="rounded-lg border p-4 relative overflow-hidden">
      <div className={`h-1 w-full absolute top-0 left-0 bg-gradient-to-r ${gradient}`}></div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function OnboardingStep({ number, title, description, isCompleted, link }: { 
  number: number; 
  title: string; 
  description: string; 
  isCompleted: boolean;
  link: string;
}) {
  return (
    <Link href={link} className="block">
      <div className="rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start">
          <div className={`w-8 h-8 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'} flex items-center justify-center font-semibold mr-3`}>
            {isCompleted ? <Check className="h-4 w-4" /> : number}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TokenCard({ name, fullName, description, gradient, small = false }: { 
  name: string; 
  fullName: string; 
  description: string; 
  gradient: string;
  small?: boolean;
}) {
  return (
    <div className={`rounded-lg border relative overflow-hidden ${small ? 'p-2' : 'p-4'}`}>
      <div className={`h-1 w-full absolute top-0 left-0 bg-gradient-to-r ${gradient}`}></div>
      <div className="flex items-center">
        <div className={`${small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-bold mr-3`}>
          {name}
        </div>
        <div>
          <h3 className={`font-semibold ${small ? 'text-sm' : 'text-lg'}`}>{fullName}</h3>
          <p className={`${small ? 'text-xs' : 'text-sm'} text-slate-500`}>{description}</p>
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ title, description, reward, difficulty }: { 
  title: string; 
  description: string; 
  reward: string;
  difficulty: string;
}) {
  const difficultyColor = 
    difficulty === 'Easy' ? 'bg-green-100 text-green-600' : 
    difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 
    'bg-red-100 text-red-600';
  
  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor}`}>
          {difficulty}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-3">{description}</p>
      <div className="flex items-center">
        <Star className="h-4 w-4 text-amber-500 mr-1" />
        <span className="text-sm font-medium">{reward}</span>
      </div>
    </div>
  );
}

function FeatureUnlockCard({ title, description, requirement, icon }: { 
  title: string; 
  description: string; 
  requirement: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl mr-3">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-slate-500 mb-1">{description}</p>
          <div className="flex items-center mt-2">
            <div className="text-xs px-2 py-1 bg-slate-100 rounded-full">
              Requirement: {requirement}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
