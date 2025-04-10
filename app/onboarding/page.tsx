"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Star, Shield, UserCircle, Users, Globe } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTracking } from '@/utils/tracking';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [agreedToLaw, setAgreedToLaw] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const tracking = useTracking(userId);

  // Get the current user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        // Track page view
        tracking.trackPageView('onboarding');
      } else {
        // Redirect to login if no session
        router.push('/auth/login?redirect=/onboarding');
      }
    };

    getUserId();
  }, [router, supabase, tracking]);

  const verifyInviteCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invitation code required",
        description: "Please enter your invitation code to continue.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsVerifying(true);
    
    try {
      // Verify invite code
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', inviteCode)
        .single();
        
      if (error || !data) {
        toast({
          title: "Invalid invitation code",
          description: "The code you entered is not valid. Please check and try again.",
          variant: "destructive"
        });
        return false;
      }
      
      if (data.used) {
        toast({
          title: "Code already used",
          description: "This invitation code has already been used.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Invite code verified",
        description: "Your invitation code has been verified successfully.",
      });
      
      setCodeVerified(true);
      
      // Track the step completion
      tracking.trackAction('page_view', { details: { page: 'onboarding', step: 'invite_verified' } });
      
      return true;
    } catch (err) {
      console.error("Error verifying invite code:", err);
      toast({
        title: "Verification error",
        description: "An error occurred while verifying your code. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const verified = await verifyInviteCode();
      if (verified) {
        setStep(2);
      }
    }
  };

  const completeOnboarding = async () => {
    if (!agreedToLaw) {
      toast({
        title: "Agreement required",
        description: "You must agree to The Prime Law to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedJourney) {
      toast({
        title: "Journey selection required",
        description: "Please select a journey to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      // Mark the invitation code as used
      await supabase
        .from('invitation_codes')
        .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
        .eq('code', inviteCode);
      
      let journeyName = "";
      let tokenType = "";
      
      if (selectedJourney === 'SAP') {
        journeyName = "Superachiever";
        tokenType = "PSP";
      } else if (selectedJourney === 'SCQ') {
        journeyName = "Supercivilization";
        tokenType = "SPD";
      } else if (selectedJourney === 'SSA') {
        journeyName = "Superachievers";
        tokenType = "SSA";
      }
      
      // Save user journey preference
      await supabase
        .from('user_journey_preferences')
        .upsert({
          user_id: user.id,
          primary_journey: selectedJourney,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_variant: 'streamlined'
        });
      
      // Award initial tokens
      await supabase
        .from('token_transactions')
        .insert({
          to_user_id: user.id,
          token_type: tokenType,
          amount: 5,
          reason: `Initial ${journeyName} journey tokens`,
          transaction_type: 'onboarding_reward'
        });
      
      // Track completion
      tracking.trackAction('page_view', { 
        details: { 
          page: 'onboarding_complete',
          journey: selectedJourney,
          accepted_prime_law: agreedToLaw,
          variant: 'streamlined'
        }
      });
      
      // Show success message
      toast({
        title: `Welcome to the ${journeyName} journey!`,
        description: `+5 ${tokenType} tokens added to your account`,
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error("Error completing onboarding:", err);
      toast({
        title: "Error",
        description: "An error occurred while completing onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Avolve</h1>
        <p className="text-zinc-400">Complete these steps to begin your journey</p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                stepNumber < step 
                  ? 'bg-green-500 text-white' 
                  : stepNumber === step 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-zinc-800 text-zinc-400'
              }`}>
                {stepNumber < step ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span className="text-xs mt-1 text-zinc-400">
                {stepNumber === 1 ? 'Invite' : 'Journey'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-1 w-full bg-zinc-800 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${(step - 1) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {step === 1 && (
        <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Enter Your Invitation Code</CardTitle>
            <CardDescription>
              To join Avolve, you need a valid invitation code. If you don't have one, please contact an existing member.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Enter your invitation code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={isVerifying}
              />
              
              <Button 
                onClick={handleNextStep}
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {step === 2 && (
        <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Select Your Journey</CardTitle>
            <CardDescription>
              Choose the journey that resonates most with you and accept The Prime Law to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <h3 className="text-lg font-medium mb-2">The Prime Law</h3>
                <p className="text-zinc-300 italic text-sm">
                  The Prime Law is the fundamental law of protection. It states that no person or group of people shall initiate force, threat of force, or fraud against any other person or group of people. This is the foundation of a civilized society.
                </p>
                <div className="flex items-start space-x-3 mt-4">
                  <Checkbox id="prime-law" checked={agreedToLaw} onCheckedChange={(checked) => setAgreedToLaw(checked as boolean)} />
                  <Label htmlFor="prime-law" className="text-sm cursor-pointer">
                    I understand and agree to abide by The Prime Law in all my interactions within the Avolve ecosystem.
                  </Label>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Select Your Primary Journey</h3>
                <Tabs defaultValue="sap" className="w-full" onValueChange={(value) => setSelectedJourney(value === 'sap' ? 'SAP' : value === 'ssa' ? 'SSA' : 'SCQ')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sap">Superachiever</TabsTrigger>
                    <TabsTrigger value="ssa">Superachievers</TabsTrigger>
                    <TabsTrigger value="scq">Supercivilization</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sap" className="space-y-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <UserCircle className="h-5 w-5 text-amber-500" />
                      <h3 className="text-lg font-medium">Personal Success Journey</h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Focus on your individual growth and achievement. Develop your skills, habits, and mindset to reach your highest potential.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-zinc-400">
                      <span>Primary token:</span>
                      <span className="font-medium text-amber-500">PSP</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="ssa" className="space-y-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-medium">Community Success Journey</h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Collaborate with other achievers to solve collective challenges.
                      Build connections and contribute to a network of extraordinary individuals.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-zinc-400">
                      <span>Primary token:</span>
                      <span className="font-medium text-blue-500">SSA</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="scq" className="space-y-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-zinc-400" />
                      <h3 className="text-lg font-medium">Civilization Building Journey</h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Participate in building a new kind of civilization based on The Prime Law.
                      Shape governance, innovation, and societal structures.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-zinc-400">
                      <span>Primary token:</span>
                      <span className="font-medium text-zinc-400">SPD</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <Button 
                onClick={completeOnboarding}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Setting up your journey..." : "Complete & Go to Dashboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
