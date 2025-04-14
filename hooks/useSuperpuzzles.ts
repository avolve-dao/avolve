'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';

interface Superpuzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward_amount: number;
  reward_token: string;
  completed: boolean;
  progress: number;
  total_required: number;
  tokens?: any;
  required_points?: number;
  teamContributions?: any[];
  status?: 'draft' | 'active' | 'completed' | 'archived';
  name?: string;
}

export function useSuperpuzzles() {
  const [puzzles, setPuzzles] = useState<Superpuzzle[]>([]);
  const [activeSuperpuzzles, setActiveSuperpuzzles] = useState<Superpuzzle[]>([]);
  const [todaySuperpuzzles, setTodaySuperpuzzles] = useState<Superpuzzle[]>([]);
  const [selectedSuperpuzzle, setSelectedSuperpuzzle] = useState<Superpuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadSuperpuzzles() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('superpuzzles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load superpuzzles",
          variant: "destructive"
        });
        return;
      }

      setPuzzles(data);
      setLoading(false);

      // Subscribe to puzzle updates
      const channel = supabase
        .channel('puzzle_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'superpuzzles',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadSuperpuzzles();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadSuperpuzzles();
  }, [supabase, toast]);

  const updateProgress = async (puzzleId: string, progress: number) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update progress",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('superpuzzles')
      .update({ progress })
      .eq('id', puzzleId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update puzzle progress",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Progress updated successfully!"
    });
  };

  const completeSuperpuzzle = async (puzzleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete puzzles",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('superpuzzles')
      .update({ 
        completed: true,
        progress: 100
      })
      .eq('id', puzzleId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete puzzle",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Puzzle completed successfully!"
    });
  };

  const loadSuperpuzzleDetails = async (puzzleId: string) => {
    setLoading(true);
    
    try {
      // This is a mock implementation - in a real app, you would fetch from Supabase
      const { data, error } = await supabase
        .from('superpuzzles')
        .select(`
          *,
          tokens:reward_token (*),
          teamContributions:team_contributions (
            *,
            teams:team_id (*)
          )
        `)
        .eq('id', puzzleId)
        .single();

      if (error) {
        throw error;
      }

      setSelectedSuperpuzzle(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load superpuzzle details: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSuperpuzzles = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get active superpuzzles
      const { data, error } = await supabase
        .from('superpuzzles')
        .select(`
          *,
          tokens:reward_token (*)
        `)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      setActiveSuperpuzzles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load active superpuzzles: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTodaySuperpuzzles = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get today's token symbol based on day of week
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const tokenSymbol = getTokenSymbolForDay(dayOfWeek);

      // Get superpuzzles for today's token
      const { data, error } = await supabase
        .from('superpuzzles')
        .select(`
          *,
          tokens:reward_token (*)
        `)
        .eq('tokens.symbol', tokenSymbol)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      setTodaySuperpuzzles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load today's superpuzzles: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get token symbol for day of week
  const getTokenSymbolForDay = (day: number): string => {
    const symbols = [
      'SPD', // Sunday
      'SHE', // Monday
      'PSP', // Tuesday
      'SSA', // Wednesday
      'BSP', // Thursday
      'SGB', // Friday
      'SMS', // Saturday
    ];
    return symbols[day];
  };

  // Helper function to get token name for day of week
  const getTokenNameForDay = (day: number): string => {
    const names = [
      'Superpuzzle Developments', // Sunday
      'Superhuman Enhancements', // Monday
      'Personal Success Puzzle', // Tuesday
      'Supersociety Advancements', // Wednesday
      'Business Success Puzzle', // Thursday
      'Supergenius Breakthroughs', // Friday
      'Supermind Superpowers', // Saturday
    ];
    return names[day];
  };

  return {
    puzzles,
    activeSuperpuzzles,
    todaySuperpuzzles,
    selectedSuperpuzzle,
    loading,
    updateProgress,
    completeSuperpuzzle,
    loadSuperpuzzleDetails,
    loadActiveSuperpuzzles,
    loadTodaySuperpuzzles,
    getTokenNameForDay
  };
}
