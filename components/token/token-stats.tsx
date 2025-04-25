'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTokens } from '@/hooks/use-tokens';
import { TokenBadge } from './token-badge';
import { cn } from '@/lib/utils';

interface TokenStatsProps {
  tokenCode: string;
  tokenName: string;
  tokenSymbol: string;
  gradientClass: string;
  className?: string;
}

/**
 * TokenStats displays token-related progress and statistics
 */
export function TokenStats({
  tokenCode,
  tokenName,
  tokenSymbol,
  gradientClass,
  className,
}: TokenStatsProps) {
  const { tokens, userBalances, isLoading } = useTokens();
  const [balance, setBalance] = React.useState<number>(0);
  const [level, setLevel] = React.useState<number>(0);
  const [progress, setProgress] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const tokenBalance = userBalances[tokenCode] || 0;
        setBalance(tokenBalance);

        // Calculate level based on balance (example formula)
        const calculatedLevel = Math.floor(Math.sqrt(tokenBalance / 10));
        setLevel(calculatedLevel);

        // Calculate progress to next level
        const nextLevelThreshold = Math.pow(calculatedLevel + 1, 2) * 10;
        const currentLevelThreshold = Math.pow(calculatedLevel, 2) * 10;
        const levelProgress =
          ((tokenBalance - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) *
          100;
        setProgress(Math.min(Math.max(levelProgress, 0), 100));
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchTokenData();
  }, [tokenCode, userBalances]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'border-l-4 shadow-sm',
          `border-l-${gradientClass.split(' ')[0].replace('from-', '')}`
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span
              className={cn(
                'text-lg font-medium bg-gradient-to-r bg-clip-text text-transparent',
                gradientClass
              )}
            >
              {tokenName} Progress
            </span>
            <TokenBadge
              tokenCode={tokenCode}
              tokenName={tokenName}
              tokenSymbol={tokenSymbol}
              showBalance={true}
              size="md"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                    <div className="text-2xl font-bold">{level}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Balance</div>
                    <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Next Level</div>
                    <div className="text-2xl font-bold">{level + 1}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to Level {level + 1}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className={cn(
                      'h-2 bg-muted',
                      `[&::-webkit-progress-value]:bg-gradient-to-r ${gradientClass}`
                    )}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Tip:</span> Complete actions in this section to earn
                  more {tokenSymbol} tokens and unlock additional features.
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
