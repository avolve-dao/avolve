'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { TokenIcon } from '@/components/token/token-icon';

interface TokenFlow {
  source: string;
  target: string;
  amount: number;
  token_type: string;
  timestamp: string;
}

export function TokenVisualization() {
  const [flows, setFlows] = useState<TokenFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadTokenFlows() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('token_flows')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load token flows",
          variant: "destructive"
        });
        return;
      }

      setFlows(data);
      setLoading(false);

      // Subscribe to flow updates
      const channel = supabase
        .channel('flow_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'token_flows',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadTokenFlows();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadTokenFlows();
  }, [supabase, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  if (!flows.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No token flows available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {flows.map((flow) => (
        <Card key={`${flow.timestamp}-${flow.source}-${flow.target}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TokenIcon type={flow.token_type} />
                <div>
                  <p className="font-medium">
                    {flow.source} → {flow.target}
                  </p>
                  <p className="text-2xl font-bold">{flow.amount}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(flow.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
