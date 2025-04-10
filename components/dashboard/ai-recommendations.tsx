'use client';

/**
 * AI Recommendations Component
 * 
 * Provides personalized suggestions based on user's regen analytics
 * to reduce decision effort and enhance engagement.
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  BookOpen, 
  Award, 
  Zap, 
  Brain, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';

// Types
import type { Database } from '@/types/supabase';

interface AIRecommendationsProps {
  userId: string;
}

interface Recommendation {
  id: string;
  type: 'event' | 'content' | 'community' | 'token';
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  actionUrl: string;
  priority: number;
  reason: string;
}

export function AIRecommendations({ userId }: AIRecommendationsProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        
        // Fetch recommendations from our AI API endpoint
        const response = await fetch('/api/journey-ai/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Unable to load recommendations');
        
        // Fallback to static recommendations if API fails
        setRecommendations(getStaticRecommendations());
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
    
    // Set up real-time subscription for updates
    const channel = supabase.channel('ai-recommendations');
    channel
      .on('broadcast', { event: 'recommendation_update' }, (payload) => {
        if (payload.payload.userId === userId) {
          fetchRecommendations();
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
  
  // Handle recommendation click
  const handleRecommendationClick = async (recommendation: Recommendation) => {
    // Navigate to the recommendation target
    router.push(recommendation.actionUrl);
    
    // Log the interaction for future AI improvements
    try {
      await fetch('/api/journey-ai/track-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          recommendationId: recommendation.id,
          action: 'click',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Error tracking interaction:', err);
    }
  };
  
  // Fallback static recommendations if API fails
  function getStaticRecommendations(): Recommendation[] {
    return [
      {
        id: 'static-event-1',
        type: 'event',
        title: 'Weekly Mastermind',
        description: 'Join this week\'s mastermind session to connect with peers',
        icon: <Calendar className="w-5 h-5 text-blue-400" />,
        action: 'Join Now',
        actionUrl: '/events/weekly-mastermind',
        priority: 90,
        reason: 'Regular participation builds community connection'
      },
      {
        id: 'static-content-1',
        type: 'content',
        title: 'Superachiever Module',
        description: 'Complete the next module in your learning journey',
        icon: <BookOpen className="w-5 h-5 text-purple-400" />,
        action: 'Continue',
        actionUrl: '/learning/superachiever/module-2',
        priority: 85,
        reason: 'Builds on your previous progress'
      },
      {
        id: 'static-token-1',
        type: 'token',
        title: 'Daily Token Claim',
        description: 'Claim your daily SAP tokens to maintain your streak',
        icon: <Zap className="w-5 h-5 text-amber-400" />,
        action: 'Claim',
        actionUrl: '/tokens/claim',
        priority: 95,
        reason: 'Maintains your daily streak for bonuses'
      }
    ];
  }
  
  // Get icon for recommendation type
  const getIconForType = (type: string, defaultIcon: React.ReactNode) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'content':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'community':
        return <Users className="w-5 h-5 text-green-400" />;
      case 'token':
        return <Zap className="w-5 h-5 text-amber-400" />;
      default:
        return defaultIcon;
    }
  };
  
  if (loading) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-6 space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (error && recommendations.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 mx-auto block"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => b.priority - a.priority);
  
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400 mr-2" />
          <h3 className="text-lg font-semibold">Personalized For You</h3>
        </div>
        
        <div className="space-y-4">
          {sortedRecommendations.slice(0, 3).map((recommendation) => (
            <div 
              key={recommendation.id}
              className="group relative bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg p-4 transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 bg-zinc-800 rounded-full p-2">
                  {getIconForType(recommendation.type, recommendation.icon)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{recommendation.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleRecommendationClick(recommendation)}
                  >
                    {recommendation.action}
                    <ArrowRight className="ml-1 w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Reason tooltip */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-zinc-950/90 rounded-lg transition-opacity duration-200">
                <div className="text-center p-4">
                  <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Why we recommend this:</p>
                  <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length > 3 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-xs text-muted-foreground"
            onClick={() => router.push('/journey/recommendations')}
          >
            View All Recommendations
            <ArrowRight className="ml-1 w-3 h-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
