import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeatures } from '@/hooks/useFeatures';
import { Lock } from 'lucide-react';

interface FeatureTooltipProps {
  featureName: string;
  children: React.ReactNode;
}

export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({ featureName, children }) => {
  const { isFeatureUnlocked, getFeatureUnlockReason } = useFeatures();

  const isUnlocked = isFeatureUnlocked(featureName);
  const unlockReason = getFeatureUnlockReason(featureName);

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative cursor-not-allowed">
            <div className="opacity-50 pointer-events-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">Feature Locked</p>
          <p className="text-sm">{unlockReason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FeatureTooltip;
