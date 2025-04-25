'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: number;
}

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createClient();

  useEffect(() => {
    async function loadRecommendations() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      setRecommendations(data || []);
      setLoading(false);
    }

    loadRecommendations();
  }, [supabase]);

  const handleDismiss = async (id: string) => {
    const { error } = await supabase.from('ai_recommendations').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss recommendation',
        variant: 'destructive',
      });
      return;
    }

    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    toast({
      title: 'Success',
      description: 'Recommendation dismissed',
      variant: 'default',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No recommendations at this time.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map(rec => (
        <Card key={rec.id} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{rec.title}</h3>
              <p className="text-gray-600 mt-2">{rec.description}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {rec.type}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDismiss(rec.id)}>
              Dismiss
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
