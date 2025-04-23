'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is okay
        toast({
          title: "Error",
          description: "Failed to load subscription",
          variant: "destructive"
        });
        return;
      }

      setSubscription(data);
      setLoading(false);

      // Subscribe to subscription updates
      const channel = supabase
        .channel('subscription_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadSubscription();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadSubscription();
  }, [supabase, toast]);

  const handleCancel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to cancel subscription",
        variant: "destructive"
      });
      return;
    }

    if (!subscription?.id) {
      toast({
        title: "Error",
        description: "No active subscription found",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        auto_renew: false
      })
      .eq('id', subscription.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Subscription cancelled successfully!"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {"You can&apos;t manage your subscription here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Status</p>
            <p className="text-sm text-muted-foreground capitalize">{subscription.status}</p>
          </div>
          <div>
            <p className="font-medium">Start Date</p>
            <p className="text-sm text-muted-foreground">
              {new Date(subscription.start_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-medium">End Date</p>
            <p className="text-sm text-muted-foreground">
              {new Date(subscription.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-medium">Auto Renew</p>
            <p className="text-sm text-muted-foreground">
              {subscription.auto_renew ? 'Yes' : 'No'}
            </p>
          </div>
          {subscription.status === 'active' && (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              className="w-full"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
