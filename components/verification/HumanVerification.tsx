'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityPuzzle } from './CommunityPuzzle';
import { PatternChallenge } from './PatternChallenge';
import { ImageVerification } from './ImageVerification';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type VerificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface HumanVerificationProps {
  onVerificationComplete?: (success: boolean) => void;
  requiredScore?: number;
}

export function HumanVerification({
  onVerificationComplete,
  requiredScore = 100,
}: HumanVerificationProps) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [currentScore, setCurrentScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('puzzle');
  const { toast } = useToast();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Check if user is already verified
      const { data: verificationData, error: verificationError } = await supabase
        .from('human_verifications')
        .select('is_verified, verification_data')
        .single();

      if (verificationError && verificationError.code !== 'PGRST116') {
        throw new Error(`Error checking verification status: ${verificationError.message}`);
      }

      if (verificationData?.is_verified) {
        setVerificationStatus('completed');
        setCurrentScore(100);
        if (onVerificationComplete) {
          onVerificationComplete(true);
        }
        return;
      }

      // If verification is in progress, restore the current score
      if (verificationData) {
        setVerificationStatus('in_progress');
        setCurrentScore(verificationData.verification_data.score || 0);
      }
    } catch (err) {
      console.error('Error in HumanVerification:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallengeComplete = async (
    points: number,
    challengeType: string,
    challengeData: any
  ) => {
    try {
      const supabase = createClient();
      const newScore = Math.min(currentScore + points, 100);
      setCurrentScore(newScore);

      // Update verification data in the database
      const { data, error } = await supabase
        .from('human_verifications')
        .upsert({
          verification_method: 'interactive_challenges',
          verification_data: {
            score: newScore,
            challenges_completed: challengeType,
            last_challenge_data: challengeData,
            last_updated: new Date().toISOString(),
          },
          is_verified: newScore >= requiredScore,
        })
        .select();

      if (error) {
        throw new Error(`Error updating verification: ${error.message}`);
      }

      // Show success toast
      toast({
        title: 'Challenge completed!',
        description: `You earned ${points} verification points.`,
        variant: 'default',
      });

      // Check if verification is now complete
      if (newScore >= requiredScore) {
        setVerificationStatus('completed');
        if (onVerificationComplete) {
          onVerificationComplete(true);
        }

        // Log verification completion
        await supabase.from('security_logs').insert({
          event_type: 'human_verification_completed',
          severity: 'info',
          details: { method: 'interactive_challenges', score: newScore },
        });
      }
    } catch (err) {
      console.error('Error updating verification:', err);
      toast({
        title: 'Error updating verification',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (verificationStatus === 'completed') {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Human Verification</CardTitle>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardDescription>Your account has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <p className="font-medium">Verification Complete</p>
          </div>
          <Progress value={100} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Human Verification</CardTitle>
        <CardDescription>Complete interactive challenges to verify your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Verification Progress</span>
            <span className="text-sm font-medium">
              {currentScore}/{requiredScore}
            </span>
          </div>
          <Progress value={(currentScore / requiredScore) * 100} className="h-2" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="puzzle">Puzzle</TabsTrigger>
            <TabsTrigger value="pattern">Pattern</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="puzzle" className="mt-0">
            <CommunityPuzzle
              onComplete={(points, data) => handleChallengeComplete(points, 'puzzle', data)}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pattern" className="mt-0">
            <PatternChallenge
              onComplete={(points, data) => handleChallengeComplete(points, 'pattern', data)}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            <ImageVerification
              onComplete={(points, data) => handleChallengeComplete(points, 'image', data)}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">
          Complete different types of challenges to earn verification points. You need{' '}
          {requiredScore} points to verify your account.
        </p>
      </CardFooter>
    </Card>
  );
}
