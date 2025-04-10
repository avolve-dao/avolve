"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Calendar, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTracking, ActivityActionType } from "@/utils/tracking";
import { TOKEN_GRADIENTS, TOKEN_NAMES, DAY_TO_TOKEN } from "../dashboard-page";

interface TodayEventCardProps {
  userId: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  token_type: string;
  token_reward: number;
  start_date: string;
  end_date: string;
  is_completed: boolean;
}

export function TodayEventCard({ userId }: TodayEventCardProps) {
  const supabase = createClient();
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  const tracking = useTracking(userId);

  useEffect(() => {
    const fetchTodayEvent = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Get today's date in ISO format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Get the day of the week (0-6, Sunday is 0)
        const dayOfWeek = today.getDay();
        const todayToken = DAY_TO_TOKEN[dayOfWeek as keyof typeof DAY_TO_TOKEN];
        
        // Fetch today's event
        const { data: events, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            token_type,
            token_reward,
            start_date,
            end_date,
            is_completed:event_completions!inner(user_id)
          `)
          .eq('token_type', todayToken)
          .eq('event_completions.user_id', userId)
          .gte('start_date', todayStr)
          .lte('end_date', todayStr)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        // If no completed event found, check for any event today
        if (!events) {
          const { data: uncompleted, error: uncomplError } = await supabase
            .from('events')
            .select(`
              id,
              title,
              description,
              token_type,
              token_reward,
              start_date,
              end_date
            `)
            .eq('token_type', todayToken)
            .gte('start_date', todayStr)
            .lte('end_date', todayStr)
            .maybeSingle();
          
          if (uncomplError && uncomplError.code !== 'PGRST116') {
            throw uncomplError;
          }
          
          if (uncompleted) {
            setTodayEvent({
              ...uncompleted,
              is_completed: false
            });
          }
        } else {
          // Transform the data to match our Event interface
          const completedEvent: Event = {
            id: events.id,
            title: events.title,
            description: events.description,
            token_type: events.token_type,
            token_reward: events.token_reward,
            start_date: events.start_date,
            end_date: events.end_date,
            is_completed: Array.isArray(events.is_completed) && events.is_completed.length > 0
          };
          
          setTodayEvent(completedEvent);
        }
      } catch (error) {
        console.error('Error fetching today\'s event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayEvent();
    
    // Set up real-time subscription for event completions
    const channel = supabase
      .channel('event-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_completions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Refresh the event data when the user completes an event
          fetchTodayEvent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const completeEvent = async () => {
    if (!todayEvent || !userId) return;
    
    setIsCompleting(true);
    try {
      // Record event completion
      const { error } = await supabase
        .from('event_completions')
        .insert({
          user_id: userId,
          event_id: todayEvent.id,
          points: todayEvent.token_reward
        });
      
      if (error) throw error;
      
      // Track the completion
      tracking.trackAction("event_complete", {
        details: {
          event_id: todayEvent.id,
          token_type: todayEvent.token_type,
          token_reward: todayEvent.token_reward
        }
      });
      
      // Update local state
      setTodayEvent({
        ...todayEvent,
        is_completed: true
      });
      
      // Show success toast
      toast({
        title: "Event Completed!",
        description: `You earned ${todayEvent.token_reward} ${todayEvent.token_type} tokens.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error completing event:', error);
      toast({
        title: "Error",
        description: "Failed to complete the event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return null; // Handled by Suspense
  }

  if (!todayEvent) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle>No Event Today</CardTitle>
          <CardDescription>Check back tomorrow for a new event</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">
            There are no scheduled events for today. Take this time to review your progress or explore other features.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tokenGradient = TOKEN_GRADIENTS[todayEvent.token_type as keyof typeof TOKEN_GRADIENTS] || 'from-zinc-400 to-zinc-600';
  const tokenName = TOKEN_NAMES[todayEvent.token_type as keyof typeof TOKEN_NAMES] || 'Token';

  return (
    <Card className={`border-zinc-800 bg-zinc-950/50 overflow-hidden`}>
      <div className={`h-2 w-full bg-gradient-to-r ${tokenGradient}`} />
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{todayEvent.title}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {todayEvent.token_type}
          </Badge>
        </div>
        <CardDescription>
          {tokenName} - {todayEvent.token_reward} tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-400 mb-4">{todayEvent.description}</p>
        <div className="flex items-center space-x-4 text-sm text-zinc-500">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>
              {new Date(todayEvent.start_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4" />
            <span>{todayEvent.token_reward} tokens</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          disabled={todayEvent.is_completed || isCompleting}
          onClick={completeEvent}
        >
          {todayEvent.is_completed ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed
            </>
          ) : isCompleting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            "Complete Event"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
