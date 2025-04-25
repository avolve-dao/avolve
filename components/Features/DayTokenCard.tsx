import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useFeatures } from '@/hooks/useFeatures';
import { Calendar, Check, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * DayTokenCard - Displays information about a day-specific token and allows users to claim it
 *
 * This component is part of the GEN-centric regenerative gamified system that:
 * 1. Drives daily active user (DAU) metrics through regular engagement
 * 2. Creates a habit-forming loop with weekly token claims
 * 3. Reinforces the three value pillars: Supercivilization, Superachiever, and Superachievers
 *
 * Each day has a specific token that can be claimed:
 * - Sunday: SPD (Superpuzzle Developments) - Boosts community engagement metrics
 * - Monday: SHE (Superhuman Enhancements) - Improves D1 retention metrics
 * - Tuesday: PSP (Personal Success Puzzle) - Increases DAU/MAU ratio
 * - Wednesday: SSA (Supersociety Advancements) - Enhances community contribution metrics
 * - Thursday: BSP (Business Success Puzzle) - Boosts ARPU metrics
 * - Friday: SGB (Supergenius Breakthroughs) - Improves innovation metrics
 * - Saturday: SMS (Supermind Superpowers) - Enhances user satisfaction and NPS
 */
interface DayTokenCardProps {
  dayName: string;
  dayOfWeek: number;
  isToday?: boolean;
}

interface TokenInfo {
  symbol: string;
  name: string;
  description: string;
  day: string;
  dayOfWeek: number;
  gradient: string;
}

export const DayTokenCard: React.FC<DayTokenCardProps> = ({
  dayName,
  dayOfWeek,
  isToday = false,
}) => {
  const { toast } = useToast();
  const { getDayTokenInfo, checkDayTokenUnlock, claimDayToken } = useFeatures();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    symbol: '',
    name: '',
    description: '',
    day: '',
    dayOfWeek: 0,
    gradient: '',
  });

  // Fetch token info when component mounts
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const info = await getDayTokenInfo(dayOfWeek);
        setTokenInfo(info);
      } catch (error) {
        console.error('Error fetching token info:', error);
      }
    };

    fetchTokenInfo();
  }, [dayOfWeek, getDayTokenInfo]);

  /**
   * Handle the token claim process
   * This is the core engagement mechanism that drives key metrics:
   * - Claiming PSP on TUE boosts DAU/MAU ratio
   * - Claiming SHE on MON improves D1 retention metrics
   * - Claiming BSP on THU boosts ARPU metrics
   * - Claiming SMS on SAT enhances NPS scores
   */
  const handleClaimToken = async () => {
    try {
      setLoading(true);

      // First check if the token is available today
      const dayStatus = await checkDayTokenUnlock(dayName.toLowerCase());

      if (!dayStatus.isUnlocked) {
        toast({
          title: 'Token not available',
          description: dayStatus.unlockReason,
          variant: 'destructive',
        });
        return;
      }

      // Attempt to claim the token
      const result = await claimDayToken(dayStatus.tokenInfo.symbol);

      if (result.success) {
        setClaimed(true);
        toast({
          title: 'Token claimed!',
          description: `You received ${result.amount || 1} ${dayStatus.tokenInfo.symbol} tokens. This contributes to your progress in the regenerative system.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Failed to claim token',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error claiming token:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while claiming the token.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine which pillar this token belongs to and its metric impact
  let pillar = 'Supercivilization';
  let metricImpact = 'Ecosystem Engagement';

  // SAP sub-tokens (individual journey)
  if (['PSP', 'BSP', 'SMS'].includes(tokenInfo.symbol)) {
    pillar = 'Superachiever';

    if (tokenInfo.symbol === 'PSP') metricImpact = 'DAU/MAU Ratio';
    if (tokenInfo.symbol === 'BSP') metricImpact = 'ARPU Metrics';
    if (tokenInfo.symbol === 'SMS') metricImpact = 'User Satisfaction';
  }
  // SCQ sub-tokens (collective journey)
  else if (['SPD', 'SHE', 'SSA', 'SGB'].includes(tokenInfo.symbol)) {
    pillar = 'Superachievers';

    if (tokenInfo.symbol === 'SPD') metricImpact = 'Community Engagement';
    if (tokenInfo.symbol === 'SHE') metricImpact = 'D1 Retention';
    if (tokenInfo.symbol === 'SSA') metricImpact = 'Community Contribution';
    if (tokenInfo.symbol === 'SGB') metricImpact = 'Innovation Metrics';
  }

  return (
    <Card className={`overflow-hidden ${isToday ? 'border-2 border-primary' : ''}`}>
      <div className={`h-2 w-full bg-gradient-to-r ${tokenInfo.gradient}`}></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {dayName}
            {isToday && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                Today
              </span>
            )}
          </CardTitle>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold text-xs"
            style={{
              backgroundImage: tokenInfo.gradient
                ? `linear-gradient(to right, ${tokenInfo.gradient.replace('from-', '').replace('to-', '').replace('via-', '')})`
                : 'linear-gradient(to right, gray, darkgray)',
            }}
          >
            {tokenInfo.symbol}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <CardDescription>{tokenInfo.name}</CardDescription>
          <Badge variant="outline" className="text-xs">
            {pillar}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 space-y-2">
        <p className="text-sm text-muted-foreground">{tokenInfo.description}</p>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Improves {metricImpact}</span>
        </div>
      </CardContent>
      <CardFooter>
        {isToday ? (
          <Button className="w-full" onClick={handleClaimToken} disabled={loading || claimed}>
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : claimed ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Claimed
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Claim {tokenInfo.symbol} Token
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Available on {dayName}s
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DayTokenCard;
