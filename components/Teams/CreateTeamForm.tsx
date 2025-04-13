"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams } from '@/hooks/useTeams';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const CreateTeamForm: React.FC = () => {
  const router = useRouter();
  const { createTeam, checkEligibility, eligibility, eligibilityLoading, loading } = useTeams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkEligibility();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Team name is required');
      return;
    }

    const result = await createTeam(name, description);
    if (result.success) {
      router.push(`/teams/${result.teamId}`);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
        <CardTitle className="text-2xl">Create a New Team</CardTitle>
        <CardDescription className="text-slate-300">
          Teams allow you to collaborate on superpuzzles and earn rewards together
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {eligibilityLoading ? (
          <div className="py-4 text-center">
            <p>Checking eligibility...</p>
          </div>
        ) : eligibility && !eligibility.isEligible ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Eligible</AlertTitle>
            <AlertDescription>
              {eligibility.reason || `You need to complete at least ${eligibility.requiredChallenges} challenges to create a team. You've completed ${eligibility.completedChallenges} so far.`}
            </AlertDescription>
            <div className="mt-4">
              <Progress 
                value={(eligibility.completedChallenges / eligibility.requiredChallenges) * 100} 
                className="h-2"
              />
              <p className="text-xs text-right mt-1">
                {eligibility.completedChallenges}/{eligibility.requiredChallenges} challenges completed
              </p>
            </div>
          </Alert>
        ) : (
          eligibility && eligibility.isEligible && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">You're Eligible!</AlertTitle>
              <AlertDescription className="text-green-700">
                You've completed {eligibility.completedChallenges} challenges and can now create a team.
              </AlertDescription>
            </Alert>
          )
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Enter a unique team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || (eligibility && !eligibility.isEligible)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your team's mission and goals"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || (eligibility && !eligibility.isEligible)}
                rows={4}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between bg-slate-50">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || (eligibility && !eligibility.isEligible)}
          className="bg-gradient-to-r from-slate-700 to-slate-900 text-white"
        >
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateTeamForm;
