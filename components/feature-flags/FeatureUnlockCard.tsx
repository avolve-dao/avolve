import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { useTokenBalance } from '@/hooks/use-token-balance';

interface FeatureUnlockCardProps {
  featureKey: string;
  title: string;
  description: string;
  tokenRequirements: Record<string, number>;
  icon?: React.ReactNode;
  className?: string;
  onUnlock?: () => void;
}

/**
 * FeatureUnlockCard component for displaying locked features and progression
 *
 * This component is part of the Avolve platform's progression system, showing
 * users what features they can unlock and how close they are to unlocking them.
 *
 * @param featureKey - Unique identifier for the feature
 * @param title - Display name of the feature
 * @param description - Description of what the feature does
 * @param tokenRequirements - Token requirements to unlock the feature
 * @param icon - Optional custom icon
 * @param className - Additional classes to apply
 * @param onUnlock - Callback when feature is unlocked
 */
export function FeatureUnlockCard({
  featureKey,
  title,
  description,
  tokenRequirements,
  icon,
  className,
  onUnlock,
}: FeatureUnlockCardProps) {
  const { isEnabled, checkFeatureUnlock, unlockFeature } = useFeatureFlags();
  const { getBalance } = useTokenBalance();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);
  const [unlockProgress, setUnlockProgress] =
    useState < Record<string, { current: number; required: number; percent: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  // Check if feature is already enabled
  useEffect(() => {
    const checkEnabled = async () => {
      const enabled = await isEnabled(featureKey);
      setIsUnlocked(enabled);
    };

    checkEnabled();
  }, [featureKey, isEnabled]);

  // Calculate unlock progress
  useEffect(() => {
    const calculateProgress = async () => {
      const progress: Record<string, { current: number; required: number; percent: number }> = {};
      let allRequirementsMet = true;

      for (const [tokenType, requiredAmount] of Object.entries(tokenRequirements)) {
        const currentBalance = await getBalance(tokenType);
        const percent = Math.min(100, Math.round((currentBalance / requiredAmount) * 100));

        progress[tokenType] = {
          current: currentBalance,
          required: requiredAmount,
          percent,
        };

        if (currentBalance < requiredAmount) {
          allRequirementsMet = false;
        }
      }

      setUnlockProgress(progress);
      setCanUnlock(allRequirementsMet && !isUnlocked);
    };

    if (!isUnlocked) {
      calculateProgress();
    }
  }, [featureKey, tokenRequirements, getBalance, isUnlocked]);

  // Handle unlock action
  const handleUnlock = async () => {
    if (!canUnlock || isLoading) return;

    setIsLoading(true);

    try {
      const result = await unlockFeature(featureKey);

      if (result.success) {
        setShowUnlockAnimation(true);

        // After animation completes
        setTimeout(() => {
          setIsUnlocked(true);
          setShowUnlockAnimation(false);
          if (onUnlock) onUnlock();
        }, 2500);
      }
    } catch (error) {
      console.error('Error unlocking feature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Sparkles className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-primary">Feature Unlocked!</h3>
              <p className="text-center mt-2">You've unlocked {title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {icon ||
            (isUnlocked ? (
              <Sparkles className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ))}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {!isUnlocked && (
          <div className="space-y-3">
            {Object.entries(unlockProgress).map(([tokenType, progress]) => (
              <div key={tokenType} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{tokenType} Tokens</span>
                  <span
                    className={
                      progress.percent >= 100 ? 'text-primary font-medium' : 'text-muted-foreground'
                    }
                  >
                    {progress.current} / {progress.required}
                  </span>
                </div>
                <Progress value={progress.percent} className="h-2" />
              </div>
            ))}
          </div>
        )}

        {isUnlocked && (
          <div className="bg-primary/10 text-primary rounded-md p-3 text-sm">
            <Sparkles className="h-4 w-4 inline-block mr-2" />
            This feature is unlocked and available to use!
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isUnlocked ? (
          <Button variant="outline" className="w-full" onClick={onUnlock}>
            Use Feature <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            disabled={!canUnlock || isLoading}
            onClick={handleUnlock}
          >
            {isLoading ? 'Unlocking...' : canUnlock ? 'Unlock Now' : 'Not Enough Tokens'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default FeatureUnlockCard;
