import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useSuperpuzzles } from '@/hooks/useSuperpuzzles';
import { useTeams } from '@/hooks/useTeams';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

interface ContributeFormProps {
  superpuzzleId: string;
  teamId: string;
}

export const ContributeForm: React.FC<ContributeFormProps> = ({ superpuzzleId, teamId }) => {
  const router = useRouter();
  const user = useUser();
  const { showToast } = useToast();
  const [points, setPoints] = useState<number>(10);
  const [error, setError] = useState<string>('');
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    reason?: string;
  } | null>(null);
  
  const { 
    loading: superpuzzleLoading, 
    selectedSuperpuzzle, 
    loadSuperpuzzleDetails,
    checkContributionEligibility,
    contributeToSuperpuzzle
  } = useSuperpuzzles();
  
  const { 
    loading: teamLoading, 
    selectedTeam, 
    loadTeamDetails
  } = useTeams();

  useEffect(() => {
    loadSuperpuzzleDetails(superpuzzleId);
    loadTeamDetails(teamId);
    
    if (user) {
      checkEligibility();
    }
  }, [superpuzzleId, teamId, user]);

  const checkEligibility = async () => {
    if (!user) return;
    
    const result = await checkContributionEligibility(teamId, superpuzzleId);
    setEligibility(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to contribute');
      return;
    }

    if (!eligibility?.isEligible) {
      setError(eligibility?.reason || 'You are not eligible to contribute');
      return;
    }

    if (points < 1) {
      setError('You must contribute at least 1 point');
      return;
    }

    const result = await contributeToSuperpuzzle(teamId, superpuzzleId, points);
    if (result.success) {
      showToast('success', 'Contribution successful!');
      router.push(`/superpuzzles/${superpuzzleId}`);
    }
  };

  const loading = superpuzzleLoading || teamLoading;

  // Get gradient class based on token symbol
  const getGradientClass = (symbol: string) => {
    switch (symbol) {
      case 'SPD': // Sunday
        return 'from-red-500 via-green-500 to-blue-500';
      case 'SHE': // Monday
        return 'from-rose-500 via-red-500 to-orange-500';
      case 'PSP': // Tuesday
        return 'from-amber-500 to-yellow-500';
      case 'SSA': // Wednesday
        return 'from-lime-500 via-green-500 to-emerald-500';
      case 'BSP': // Thursday
        return 'from-teal-500 to-cyan-500';
      case 'SGB': // Friday
        return 'from-sky-500 via-blue-500 to-indigo-500';
      case 'SMS': // Saturday
        return 'from-violet-500 via-purple-500 to-fuchsia-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  if (loading && (!selectedSuperpuzzle || !selectedTeam)) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!selectedSuperpuzzle || !selectedTeam) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {!selectedSuperpuzzle ? 'Superpuzzle not found.' : 'Team not found.'}
        </AlertDescription>
      </Alert>
    );
  }

  const gradientClass = getGradientClass(selectedSuperpuzzle.tokens.symbol);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className={`bg-gradient-to-r ${gradientClass} text-white`}>
        <CardTitle className="text-2xl">Contribute to Superpuzzle</CardTitle>
        <CardDescription className="text-white text-opacity-90">
          {selectedSuperpuzzle.name} with {selectedTeam.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {eligibility === null ? (
          <div className="py-4 text-center">
            <p>Checking eligibility...</p>
          </div>
        ) : !eligibility.isEligible ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Eligible</AlertTitle>
            <AlertDescription>
              {eligibility.reason || 'You are not eligible to contribute to this superpuzzle.'}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">You're Eligible!</AlertTitle>
            <AlertDescription className="text-green-700">
              You can contribute to this superpuzzle with your team.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="superpuzzle">Superpuzzle</Label>
              <Input
                id="superpuzzle"
                value={selectedSuperpuzzle.name}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={selectedTeam.name}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Contribution Points: {points}</Label>
              <Slider
                id="points"
                min={1}
                max={100}
                step={1}
                value={[points]}
                onValueChange={(value) => setPoints(value[0])}
                disabled={loading || !eligibility?.isEligible}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Contribution Benefits</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Earn SCQ tokens when your team completes the superpuzzle</li>
                <li>Boost your Community Health metrics</li>
                <li>Unlock special token rewards based on the day's token</li>
                <li>Collaborate with your team to achieve greater results</li>
              </ul>
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
          disabled={loading || !eligibility?.isEligible}
          className={`bg-gradient-to-r ${gradientClass} text-white`}
        >
          {loading ? 'Contributing...' : 'Contribute Points'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContributeForm;
