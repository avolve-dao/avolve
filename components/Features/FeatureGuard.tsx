'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeatures } from '@/hooks/useFeatures';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface FeatureGuardProps {
  featureName: string;
  fallbackUrl?: string;
  children: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  featureName, 
  fallbackUrl = '/',
  children 
}) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const { checkFeatureUnlock } = useFeatures();
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      const checkAccess = async () => {
        if (!session?.user) {
          setLoading(false);
          return;
        }

        try {
          const result = await checkFeatureUnlock(featureName);
          setIsUnlocked(result.isUnlocked);
          setUnlockReason(result.unlockReason);
        } catch (error) {
          console.error(`Error checking ${featureName} access:`, error);
        } finally {
          setLoading(false);
        }
      };

      checkAccess();
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [featureName, supabase, checkFeatureUnlock]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 mx-auto bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isUnlocked) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-100">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-center">Feature Locked</CardTitle>
          <CardDescription className="text-center">
            This feature is not yet available to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            {unlockReason}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push(fallbackUrl)}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <>{children}</>;
};

export default FeatureGuard;
