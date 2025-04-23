'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTrustLevel?: number;
  requiredTokens?: Array<{ symbol: string; amount: number }>;
}

/**
 * A component that protects routes by requiring authentication
 * and optionally specific trust levels or token balances
 */
export default function ProtectedRoute({
  children,
  requiredTrustLevel = 1,
  requiredTokens = [],
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login?returnUrl=' + encodeURIComponent(window.location.pathname));
          return;
        }

        // If trust level is required, check user's trust level
        if (requiredTrustLevel > 1) {
          const { data: trustData, error: trustError } = await supabase
            .from('trust_scores')
            .select('level')
            .eq('user_id', user.id)
            .single();

          if (trustError || !trustData || trustData.level < requiredTrustLevel) {
            router.push('/verification?returnUrl=' + encodeURIComponent(window.location.pathname));
            return;
          }
        }

        // If tokens are required, check user's token balances
        if (requiredTokens.length > 0) {
          // Use a different approach to avoid join issues
          const { data: tokenData, error: tokenError } = await supabase
            .rpc('get_user_token_balances', {
              p_user_id: user.id,
              p_symbols: requiredTokens.map(t => t.symbol)
            });

          if (tokenError || !tokenData) {
            router.push('/tokens?returnUrl=' + encodeURIComponent(window.location.pathname));
            return;
          }

          // Check if user has sufficient token balances
          const hasRequiredTokens = requiredTokens.every(requiredToken => {
            const userToken = tokenData.find((t: { symbol: string; balance: number }) => t.symbol === requiredToken.symbol);
            return userToken && userToken.balance >= requiredToken.amount;
          });

          if (!hasRequiredTokens) {
            router.push('/tokens?returnUrl=' + encodeURIComponent(window.location.pathname));
            return;
          }
        }

        // User is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredTrustLevel, requiredTokens, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying access...</span>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
