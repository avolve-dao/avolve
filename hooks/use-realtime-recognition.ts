import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase/use-supabase';

export interface Recognition {
  id: number;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  message: string;
  badge?: string;
  created_at: string;
}

export interface RecognitionReaction {
  id: number;
  recognition_id: number;
  user_id: string;
  user_name: string;
  reaction_type: string;
  created_at: string;
}

interface UseRealtimeRecognitionOptions {
  userId?: string;
  limit?: number;
  onNewRecognition?: (recognition: Recognition) => void;
  onNewReaction?: (reaction: RecognitionReaction) => void;
}

/**
 * Hook for real-time recognition updates using Supabase Realtime
 *
 * This hook subscribes to recognition events and reactions in real-time,
 * following Supabase best practices for Realtime Broadcast.
 *
 * @param options Configuration options
 * @returns Recognition data and functions
 */
export function useRealtimeRecognition({
  userId,
  limit = 20,
  onNewRecognition,
  onNewReaction,
}: UseRealtimeRecognitionOptions = {}) {
  const { supabase, user } = useSupabase();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [reactions, setReactions] = useState<RecognitionReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  // Fetch initial recognitions
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('peer_recognition')
          .select(
            `
            id,
            sender_id,
            sender:profiles!peer_recognition_sender_id_fkey(full_name),
            recipient_id,
            recipient:profiles!peer_recognition_recipient_id_fkey(full_name),
            message,
            badge,
            created_at
          `
          )
          .order('created_at', { ascending: false })
          .limit(limit);

        // Filter by user if specified
        if (userId) {
          query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(`Error fetching recognitions: ${fetchError.message}`);
        }

        // Transform data to match the Recognition interface
        const formattedData = data.map(item => ({
          id: item.id,
          sender_id: item.sender_id,
          sender_name: item.sender?.full_name || 'Unknown',
          recipient_id: item.recipient_id,
          recipient_name: item.recipient?.full_name || 'Unknown',
          message: item.message,
          badge: item.badge,
          created_at: item.created_at,
        }));

        setRecognitions(formattedData);

        // Fetch reactions if we have recognitions
        if (formattedData.length > 0) {
          const recognitionIds = formattedData.map(r => r.id);

          const { data: reactionData, error: reactionError } = await supabase
            .from('recognition_reactions')
            .select(
              `
              id,
              recognition_id,
              user_id,
              user:profiles!recognition_reactions_user_id_fkey(full_name),
              reaction_type,
              created_at
            `
            )
            .in('recognition_id', recognitionIds);

          if (reactionError) {
            console.error(`Error fetching reactions: ${reactionError.message}`);
          } else {
            // Transform reaction data
            const formattedReactions = reactionData.map(item => ({
              id: item.id,
              recognition_id: item.recognition_id,
              user_id: item.user_id,
              user_name: item.user?.full_name || 'Unknown',
              reaction_type: item.reaction_type,
              created_at: item.created_at,
            }));

            setReactions(formattedReactions);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error in useRealtimeRecognition:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [supabase, userId, limit]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!supabase) return;

    // Clean up previous channels
    channels.forEach(channel => {
      channel.unsubscribe();
    });

    // Create new channels array
    const newChannels: RealtimeChannel[] = [];

    // Subscribe to recognition events
    const recognitionChannel = supabase
      .channel('recognition_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'peer_recognition',
        },
        (payload: RealtimePostgresChangesPayload<Recognition>) => {
          const newRecognition = payload.new as Recognition;

          // Only update if we're not filtering or if this recognition is relevant to the user
          if (
            !userId ||
            newRecognition.sender_id === userId ||
            newRecognition.recipient_id === userId
          ) {
            setRecognitions(prev => [newRecognition, ...prev].slice(0, limit));

            // Call the callback if provided
            if (onNewRecognition) {
              onNewRecognition(newRecognition);
            }
          }
        }
      )
      .subscribe();

    newChannels.push(recognitionChannel);

    // Subscribe to reaction events
    const reactionChannel = supabase
      .channel('recognition_reaction_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recognition_reactions',
        },
        (payload: RealtimePostgresChangesPayload<RecognitionReaction>) => {
          const newReaction = payload.new as RecognitionReaction;

          // Check if this reaction is for a recognition we're displaying
          if (recognitions.some(r => r.id === newReaction.recognition_id)) {
            setReactions(prev => [newReaction, ...prev]);

            // Call the callback if provided
            if (onNewReaction) {
              onNewReaction(newReaction);
            }
          }
        }
      )
      .subscribe();

    newChannels.push(reactionChannel);

    // Update channels state
    setChannels(newChannels);

    // Clean up on unmount
    return () => {
      newChannels.forEach(channel => {
        channel.unsubscribe();
      });
    };
  }, [supabase, recognitions, userId, limit, onNewRecognition, onNewReaction]);

  // Add reaction function
  const addReaction = useCallback(
    async (recognitionId: number, reactionType: string) => {
      if (!user) {
        throw new Error('User must be logged in to add a reaction');
      }

      const { data, error } = await supabase
        .from('recognition_reactions')
        .insert({
          recognition_id: recognitionId,
          user_id: user.id,
          reaction_type: reactionType,
        })
        .select();

      if (error) {
        throw new Error(`Error adding reaction: ${error.message}`);
      }

      return data[0];
    },
    [supabase, user]
  );

  // Remove reaction function
  const removeReaction = useCallback(
    async (reactionId: number) => {
      if (!user) {
        throw new Error('User must be logged in to remove a reaction');
      }

      const { error } = await supabase
        .from('recognition_reactions')
        .delete()
        .eq('id', reactionId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Error removing reaction: ${error.message}`);
      }

      // Update local state
      setReactions(prev => prev.filter(r => r.id !== reactionId));

      return true;
    },
    [supabase, user]
  );

  // Send recognition function
  const sendRecognition = useCallback(
    async (recipientId: string, message: string, badge?: string) => {
      if (!user) {
        throw new Error('User must be logged in to send recognition');
      }

      const { data, error } = await supabase
        .from('peer_recognition')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message: message.trim(),
          badge,
        })
        .select();

      if (error) {
        throw new Error(`Error sending recognition: ${error.message}`);
      }

      return data[0];
    },
    [supabase, user]
  );

  // Get reactions for a specific recognition
  const getReactionsForRecognition = useCallback(
    (recognitionId: number) => {
      return reactions.filter(r => r.recognition_id === recognitionId);
    },
    [reactions]
  );

  return {
    recognitions,
    reactions,
    loading,
    error,
    addReaction,
    removeReaction,
    sendRecognition,
    getReactionsForRecognition,
  };
}
