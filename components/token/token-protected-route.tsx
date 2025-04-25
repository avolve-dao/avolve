import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AccessDeniedView from '@/components/token/access-denied-view';

interface TokenProtectedRouteProps {
  children: ReactNode;
  requiredToken?: string;
  resourceType?: 'pillar' | 'section' | 'component';
  resourceId?: string;
  isIntroductory?: boolean;
}

/**
 * Component that protects routes based on token ownership
 * Allows free test users to access introductory content
 */
export default function TokenProtectedRoute({
  children,
  requiredToken,
  resourceType,
  resourceId,
  isIntroductory = false,
}: TokenProtectedRouteProps) {
  const router = useRouter();
  const { session, user } = useSupabase();
  const { tokens, userBalances } = useTokens();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userPhase, setUserPhase] = useState<string>('discovery');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        // Track page view for analytics
        // await trackUserActivity(
        //   'page_view',
        //   resourceType,
        //   resourceId,
        //   { path: router.asPath }
        // );

        // Get user experience phase
        // const phaseResult = await getUserExperiencePhase();
        // if (phaseResult.data) {
        //   setUserPhase(phaseResult.data);
        // }

        // Check for introductory content access
        if (isIntroductory) {
          // const introAccess = await hasIntroductoryAccess(requiredToken || 'introductory');
          // if (introAccess) {
          //   setHasAccess(true);
          //   setIsChecking(false);
          //   return;
          // }
        }

        // Check if this is the first section in a pillar (for free access)
        if (resourceType === 'section' && resourceId) {
          // const firstSectionCheck = await isFirstSection(resourceId);
          // if (firstSectionCheck) {
          //   setHasAccess(true);
          //   setIsChecking(false);
          //   return;
          // }
        }

        // Standard token check
        if (requiredToken) {
          // const tokenAccess = await hasToken(requiredToken);
          // setHasAccess(tokenAccess);
        } else if (resourceType && resourceId) {
          // const resourceAccess = await checkResourceAccess(resourceType, resourceId);
          // setHasAccess(resourceAccess);
        } else {
          // If no token or resource is specified, allow access
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [session, requiredToken, resourceType, resourceId, router.asPath]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return (
      <AccessDeniedView
        requiredToken={requiredToken}
        resourceType={resourceType}
        resourceId={resourceId}
        userPhase={userPhase}
      />
    );
  }

  return <>{children}</>;
}
