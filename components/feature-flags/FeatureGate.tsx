'use client';

import React, { ReactNode } from 'react';
import { useFeatureFlagContext } from '@/components/providers/FeatureFlagProvider';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Info } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  /**
   * The feature key to check
   */
  feature: string;
  /**
   * The content to render if the feature is enabled
   */
  children: ReactNode;
  /**
   * Optional fallback content to render if the feature is disabled
   */
  fallback?: ReactNode;
  /**
   * Whether to show a tooltip explaining how to unlock the feature
   */
  showTooltip?: boolean;
  /**
   * Custom tooltip content
   */
  tooltipContent?: ReactNode;
  /**
   * Whether to render nothing if the feature is disabled
   */
  renderNothing?: boolean;
  /**
   * Whether to show a button to unlock the feature
   */
  showUnlockButton?: boolean;
  /**
   * Custom unlock button text
   */
  unlockButtonText?: string;
  /**
   * URL to navigate to when the unlock button is clicked
   */
  unlockUrl?: string;
}

/**
 * FeatureGate component
 *
 * Conditionally renders content based on feature flag status
 * Can show tooltips explaining how to unlock features
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showTooltip = true,
  tooltipContent,
  renderNothing = false,
  showUnlockButton = false,
  unlockButtonText = 'Unlock Feature',
  unlockUrl = '/tokens',
}: FeatureGateProps) {
  const { isEnabled, features, loading } = useFeatureFlagContext();
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const featureEnabled = isEnabled(feature);
  const featureInfo = features[feature];

  // If loading, show nothing
  if (loading) {
    return null;
  }

  // If feature is enabled, show children
  if (featureEnabled) {
    return <>{children}</>;
  }

  // If feature is disabled and we should render nothing, return null
  if (renderNothing) {
    return null;
  }

  // Get token requirements for tooltip
  const getTokenRequirements = () => {
    const tokenReqs = featureInfo?.tokenRequirements || {};
    return Object.entries(tokenReqs).map(([token, amount]) => (
      <div key={token} className="flex justify-between">
        <span>{token}:</span>
        <span className="font-semibold">{amount}</span>
      </div>
    ));
  };

  // Default tooltip content
  const defaultTooltipContent = (
    <div className="space-y-2 max-w-xs">
      <p className="font-semibold">{featureInfo?.description || feature}</p>
      {featureInfo?.tokenRequirements && Object.keys(featureInfo.tokenRequirements).length > 0 && (
        <>
          <p className="text-sm">Required tokens to unlock:</p>
          <div className="text-sm space-y-1">{getTokenRequirements()}</div>
        </>
      )}
    </div>
  );

  // Handle unlock button click
  const handleUnlock = () => {
    router.push(unlockUrl);
  };

  // Render fallback with optional tooltip
  const renderFallback = () => {
    if (!showTooltip) {
      return fallback;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-help">
              {fallback}
              <div className="absolute top-1 right-1">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            {tooltipContent || defaultTooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Default fallback with lock icon
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md bg-muted/50 space-y-2">
      <Lock className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">This feature is locked</p>
      {showUnlockButton && (
        <Button variant="outline" size="sm" onClick={handleUnlock}>
          {unlockButtonText}
        </Button>
      )}
    </div>
  );

  return fallback ? renderFallback() : defaultFallback;
}
