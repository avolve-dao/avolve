import React from 'react';
import FeatureGuard from './FeatureGuard';

/**
 * Higher-order component to protect routes based on feature unlock status
 * 
 * @param Component The component to wrap
 * @param featureName The feature name to check ('teams', 'governance', 'marketplace')
 * @param fallbackUrl The URL to redirect to if the feature is locked
 * @returns A wrapped component with feature guard protection
 */
export function withFeatureGuard<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string,
  fallbackUrl: string = '/'
): React.FC<P> {
  const WithFeatureGuard: React.FC<P> = (props) => {
    return (
      <FeatureGuard featureName={featureName} fallbackUrl={fallbackUrl}>
        <Component {...props} />
      </FeatureGuard>
    );
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithFeatureGuard.displayName = `withFeatureGuard(${displayName})`;

  return WithFeatureGuard;
}

export default withFeatureGuard;
