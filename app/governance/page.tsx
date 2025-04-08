import React from 'react';
import { Metadata } from 'next';
import GenGovernanceOverview from '@/components/Governance/GenGovernanceOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'GEN-Centric Governance | Avolve',
  description: 'Explore the regenerative gamified governance system powered by GEN tokens',
};

export default function GovernancePage() {
  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">GEN-Centric Governance</h1>
        <p className="text-muted-foreground">
          A regenerative gamified system driving engagement, retention, and ecosystem growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regenerative Gamified System
            </CardTitle>
            <CardDescription>
              Driving metrics through daily token claims and feature unlocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The Avolve platform implements a GEN-centric regenerative system that rewards 
              consistent participation and contribution. The system is built around three main 
              value pillars:
            </p>
            
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Supercivilization (GEN)</strong> - The ecosystem journey of transformation</li>
              <li><strong>Superachiever (SAP)</strong> - The individual journey of transformation</li>
              <li><strong>Superachievers (SCQ)</strong> - The collective journey of transformation</li>
            </ul>
            
            <p>
              By claiming daily tokens and participating in the ecosystem, users unlock features,
              earn rewards, and contribute to the growth of the platform. The system is designed
              to improve key metrics like DAU/MAU ratio, retention, and user satisfaction.
            </p>
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" className="flex items-center gap-2">
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Current ecosystem metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Daily Active Users</span>
                <span className="text-green-500 font-bold">↑ 27%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">7-Day Retention</span>
                <span className="text-green-500 font-bold">↑ 42%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">DAU/MAU Ratio</span>
                <span className="text-green-500 font-bold">0.38</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg. Streak Length</span>
                <span className="text-green-500 font-bold">4.2 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Feature Unlock Rate</span>
                <span className="text-green-500 font-bold">↑ 18%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <GenGovernanceOverview />
      
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Unlocks</TabsTrigger>
          <TabsTrigger value="participation">How to Participate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GEN-Centric System Overview</CardTitle>
              <CardDescription>
                How the regenerative system works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The GEN-centric governance system is designed to create a regenerative ecosystem
                that rewards consistent participation and contribution. The system is built around
                daily token claims, streak rewards, and feature unlocks.
              </p>
              
              <h3 className="text-lg font-semibold mt-4">Key Components</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Daily Token Claims</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Each day of the week has a specific token that can be claimed, encouraging
                    regular engagement with the platform.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Streak Rewards</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consistent daily claims build a streak multiplier, increasing the rewards
                    and encouraging habit formation.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Feature Unlocks</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accumulating tokens and improving metrics unlocks new features and capabilities
                    within the platform.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Metrics-Driven Growth</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    The system is designed to improve key metrics like DAU/MAU ratio, retention,
                    and user satisfaction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Unlocks</CardTitle>
              <CardDescription>
                How to unlock new features through participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The Avolve platform uses a metrics-driven approach to feature unlocks, rewarding
                consistent participation and contribution to the ecosystem.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Teams</h4>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                      3 Day Tokens
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unlock the ability to create and join teams by claiming at least 3 different
                    day tokens. Teams allow collaborative work and shared rewards.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Governance</h4>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      100 GEN Tokens
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Participate in platform governance by accumulating at least 100 GEN tokens.
                    Vote on proposals and help shape the future of the platform.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Marketplace</h4>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                      0.3 DAU/MAU Ratio
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access the marketplace by achieving a 0.3 DAU/MAU ratio. The marketplace
                    allows trading of tokens, resources, and digital assets.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Advanced Features</h4>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                      Multiple Metrics
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unlock advanced features through continued participation and contribution.
                    These features provide enhanced capabilities and rewards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Participate</CardTitle>
              <CardDescription>
                Getting started with the GEN-centric governance system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Participating in the GEN-centric governance system is easy and rewarding.
                Follow these steps to get started:
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                    Claim Daily Tokens
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    Visit the platform daily to claim your day-specific token. Each day of the
                    week has a different token with unique benefits.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                    Build Your Streak
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    Consistent daily claims build your streak multiplier, increasing the rewards
                    you receive. Aim for a 7-day streak to maximize your rewards.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                    Complete Challenges
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    Participate in challenges to earn additional tokens and rewards. Challenges
                    range from simple tasks to complex collaborations.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                    Unlock Features
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    As you accumulate tokens and improve your metrics, you'll unlock new features
                    and capabilities within the platform.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">5</span>
                    Participate in Governance
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    Once you've accumulated enough GEN tokens, you can participate in platform
                    governance by voting on proposals and contributing to discussions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
