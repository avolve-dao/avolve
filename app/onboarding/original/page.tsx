"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Stepper, Step, StepIndicator, StepStatus, StepTitle, StepDescription, StepSeparator } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { logUserActivity } from "@/lib/analytics/activity-logger";
import { toast } from "sonner";

const journeys = [
  {
    id: "superachiever",
    title: "Superachiever",
    description: "Focus on personal achievement and individual growth",
    color: "amber"
  },
  {
    id: "superachievers",
    title: "Superachievers",
    description: "Focus on community building and collective achievement",
    color: "blue"
  },
  {
    id: "supercivilization",
    title: "Supercivilization",
    description: "Focus on governance and building a new kind of civilization",
    color: "zinc"
  }
];

export default function OriginalOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedJourney, setSelectedJourney] = useState("");
  const [acceptedPrimeLaw, setAcceptedPrimeLaw] = useState(false);
  const [goals, setGoals] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { title: "Invitation", description: "Enter your invitation code" },
    { title: "Journey", description: "Select your primary journey" },
    { title: "Agreement", description: "Accept The Prime Law" },
    { title: "Goals", description: "Set your initial goals" }
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!inviteCode) {
        setError("Please enter an invitation code");
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('invitation_codes')
          .select('*')
          .eq('code', inviteCode)
          .single();
          
        if (error || !data) {
          setError("Invalid invitation code");
          return;
        }
        
        if (data.used) {
          setError("This invitation code has already been used");
          return;
        }
        
        // Valid code, proceed to next step
        setError("");
        setCurrentStep(1);
        
        // Log activity
        logUserActivity({
          action_type: "enter_invite_code",
          details: { code: inviteCode }
        });
      } catch (err) {
        console.error("Error validating invite code:", err);
        setError("An error occurred while validating your invitation code");
      }
    } else if (currentStep === 1) {
      if (!selectedJourney) {
        setError("Please select a journey");
        return;
      }
      
      setError("");
      setCurrentStep(2);
      
      // Log activity
      logUserActivity({
        action_type: "select_journey",
        details: { journey: selectedJourney }
      });
    } else if (currentStep === 2) {
      if (!acceptedPrimeLaw) {
        setError("You must accept The Prime Law to continue");
        return;
      }
      
      setError("");
      setCurrentStep(3);
      
      // Log activity
      logUserActivity({
        action_type: "accept_prime_law",
        details: { accepted: true }
      });
    } else if (currentStep === 3) {
      if (!goals) {
        setError("Please enter your goals");
        return;
      }
      
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);
    
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
      
      // Save user journey preference
      await supabase
        .from('user_journey_preferences')
        .upsert({
          user_id: user.id,
          primary_journey: selectedJourney,
          goals: goals,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_version: 'original'
        });
      
      // Log completion activity
      logUserActivity({
        action_type: "complete_onboarding",
        details: { 
          journey: selectedJourney,
          accepted_prime_law: acceptedPrimeLaw,
          has_goals: !!goals,
          version: 'original'
        }
      });
      
      // Show success message
      toast.success("Onboarding completed successfully!");
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("An error occurred while completing onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-4">
      <Card className="w-full max-w-3xl border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Avolve</CardTitle>
          <CardDescription className="text-center">Complete your onboarding to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper index={currentStep} className="mb-8">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus complete={index < currentStep} incomplete={index > currentStep} active={index === currentStep} />
                </StepIndicator>
                <div className="flex flex-col">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </div>
                {index < steps.length - 1 && <StepSeparator />}
              </Step>
            ))}
          </Stepper>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Enter Your Invitation Code</h3>
              <p className="text-zinc-400">
                To join Avolve, you need a valid invitation code. If you don't have one, please contact an existing member.
              </p>
              <Input
                placeholder="Enter your invitation code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Select Your Primary Journey</h3>
              <p className="text-zinc-400">
                Choose the journey that resonates most with you. This will be your primary focus, but you can explore other journeys later.
              </p>
              <RadioGroup value={selectedJourney} onValueChange={setSelectedJourney}>
                {journeys.map((journey) => (
                  <div key={journey.id} className={`flex items-start space-x-3 p-4 rounded-lg border border-${journey.color}-800 bg-${journey.color}-950/20 hover:bg-${journey.color}-900/20 cursor-pointer transition-colors`}>
                    <RadioGroupItem value={journey.id} id={journey.id} />
                    <div className="space-y-1.5">
                      <Label htmlFor={journey.id} className="text-lg font-medium cursor-pointer">
                        {journey.title}
                      </Label>
                      <p className="text-sm text-zinc-400">{journey.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">The Prime Law</h3>
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-zinc-300 italic">
                  The Prime Law is the fundamental law of protection. It states that no person or group of people shall initiate force, threat of force, or fraud against any other person or group of people. This is the foundation of a civilized society.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="prime-law" checked={acceptedPrimeLaw} onCheckedChange={(checked) => setAcceptedPrimeLaw(checked as boolean)} />
                <Label htmlFor="prime-law" className="text-sm cursor-pointer">
                  I understand and agree to abide by The Prime Law in all my interactions within the Avolve ecosystem.
                </Label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Set Your Initial Goals</h3>
              <p className="text-zinc-400">
                What do you hope to achieve through your journey with Avolve? Setting clear goals will help us personalize your experience.
              </p>
              <Textarea
                placeholder="Enter your goals here..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={5}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? "Complete" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
