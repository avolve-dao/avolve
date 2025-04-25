'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { formatDistanceToNow, format } from 'date-fns';

type MembershipData = {
  id: string;
  status: string;
  plan: string;
  monthly_fee: number;
  start_date: string;
  next_billing_date: string;
  is_free_tier: boolean;
  created_at: string;
  updated_at: string;
};

export function MembershipWidget() {
  const { user } = useUser();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembershipData() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching membership data:', error);
          return;
        }

        setMembership(data as MembershipData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembershipData();
  }, [user?.id]);

  // Calculate days until next billing
  const getDaysUntilBilling = () => {
    if (!membership?.next_billing_date) return 0;

    const nextBillingDate = new Date(membership.next_billing_date);
    const today = new Date();
    const diffTime = nextBillingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilBilling = getDaysUntilBilling();
  const billingCycleLength = membership?.is_free_tier ? 365 : 30; // Free tier is yearly, paid is monthly
  const daysProgress = Math.max(0, billingCycleLength - daysUntilBilling);
  const progressPercentage = (daysProgress / billingCycleLength) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Membership Status</CardTitle>
        <CardDescription>Your current membership plan and status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : membership ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {membership.plan.charAt(0).toUpperCase() + membership.plan.slice(1)} Plan
                </h3>
                <p className="text-sm text-muted-foreground">
                  Member since {format(new Date(membership.start_date), 'MMMM d, yyyy')}
                </p>
              </div>
              <Badge variant={membership.status === 'active' ? 'default' : 'outline'}>
                {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
              </Badge>
            </div>

            {/* Free tier badge */}
            {membership.is_free_tier && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <div>
                    <h4 className="font-bold">Founding Member</h4>
                    <p className="text-xs text-white/80">
                      You're one of our first 100 members with free lifetime access!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing information */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current billing cycle</span>
                <span className="font-medium">
                  {membership.monthly_fee === 0 ? 'Free' : `$${membership.monthly_fee}/month`}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Next billing date</span>
                  <span className="font-medium">
                    {format(new Date(membership.next_billing_date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">
                  {daysUntilBilling} days remaining
                </p>
              </div>
            </div>

            {/* Token distribution info */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Monthly Token Distribution</h4>
              <p className="text-xs text-muted-foreground mb-2">
                You receive 100 GEN tokens each month as part of your membership.
              </p>
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-2">
                  <span className="text-xs text-white font-bold">G</span>
                </div>
                <span>100 GEN tokens</span>
                <Badge variant="outline" className="ml-auto">
                  Monthly
                </Badge>
              </div>
            </div>

            {/* Action buttons */}
            {!membership.is_free_tier && (
              <div className="flex gap-2">
                <Button variant="outline" className="w-full">
                  Manage Plan
                </Button>
                <Button variant="default" className="w-full">
                  Billing History
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No membership information found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
