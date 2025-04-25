import React, { useState, useEffect } from 'react';
import {
  useRealtimeRecognition,
  Recognition,
  RecognitionReaction,
} from '@/hooks/use-realtime-recognition';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Heart, ThumbsUp, Award, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecognitionFeedProps {
  userId?: string;
  limit?: number;
  className?: string;
}

/**
 * Real-time recognition feed component
 *
 * Displays a live feed of peer recognitions with reactions
 * using Supabase Realtime for instant updates
 */
export const RecognitionFeed: React.FC<RecognitionFeedProps> = ({
  userId,
  limit = 20,
  className,
}) => {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Use our custom hook for real-time recognition data
  const { recognitions, loading, error, addReaction, removeReaction, getReactionsForRecognition } =
    useRealtimeRecognition({
      userId,
      limit,
      onNewRecognition: recognition => {
        // Show toast for new recognitions
        if (recognition.recipient_id === user?.id) {
          toast({
            title: '🎉 You received recognition!',
            description: `${recognition.sender_name} recognized your contribution.`,
            variant: 'default',
          });
        }
      },
    });

  // Handle reaction click
  const handleReaction = async (recognitionId: number, reactionType: string) => {
    try {
      // Check if user has already reacted with this type
      const existingReaction = getReactionsForRecognition(recognitionId).find(
        r => r.user_id === user?.id && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove reaction if it exists
        await removeReaction(existingReaction.id);
      } else {
        // Add new reaction
        await addReaction(recognitionId, reactionType);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process reaction',
        variant: 'destructive',
      });
    }
  };

  // Delete recognition (only for sender)
  const deleteRecognition = async (id: number) => {
    try {
      const { error } = await fetch('/api/recognition/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      }).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'Recognition deleted',
        description: 'Your recognition has been removed.',
        variant: 'default',
      });

      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting recognition:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete recognition',
        variant: 'destructive',
      });
    }
  };

  // Get reaction counts for a recognition
  const getReactionCounts = (recognitionId: number) => {
    const reactions = getReactionsForRecognition(recognitionId);
    const counts: Record<string, { count: number; users: string[] }> = {};

    reactions.forEach(reaction => {
      if (!counts[reaction.reaction_type]) {
        counts[reaction.reaction_type] = { count: 0, users: [] };
      }
      counts[reaction.reaction_type].count += 1;
      counts[reaction.reaction_type].users.push(reaction.user_name);
    });

    return counts;
  };

  // Check if current user has reacted with a specific type
  const hasUserReacted = (recognitionId: number, reactionType: string) => {
    return getReactionsForRecognition(recognitionId).some(
      r => r.user_id === user?.id && r.reaction_type === reactionType
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading recognitions</h3>
        </div>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-xl font-semibold">Recognition Feed</h2>

      {loading ? (
        // Loading skeletons
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={`skeleton-${i}`} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[90%] mb-2" />
              <Skeleton className="h-4 w-[60%]" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-[120px]" />
            </CardFooter>
          </Card>
        ))
      ) : recognitions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No recognitions yet. Be the first to recognize someone!
          </p>
        </Card>
      ) : (
        // Recognition cards
        recognitions.map(recognition => {
          const reactionCounts = getReactionCounts(recognition.id);
          const isCurrentUserSender = recognition.sender_id === user?.id;

          return (
            <Card key={recognition.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${recognition.sender_name}`}
                      />
                      <AvatarFallback>
                        {recognition.sender_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{recognition.sender_name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{recognition.recipient_name}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(recognition.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            {new Date(recognition.created_at).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Badge if present */}
                  {recognition.badge && (
                    <Badge variant="outline" className="ml-auto">
                      {recognition.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="whitespace-pre-wrap">{recognition.message}</p>
              </CardContent>

              <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-0">
                <div className="flex flex-wrap gap-2">
                  {/* Reaction buttons */}
                  <Button
                    variant={hasUserReacted(recognition.id, 'like') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleReaction(recognition.id, 'like')}
                    className="gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {reactionCounts['like']?.count > 0 && reactionCounts['like'].count}
                  </Button>

                  <Button
                    variant={hasUserReacted(recognition.id, 'heart') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleReaction(recognition.id, 'heart')}
                    className="gap-1"
                  >
                    <Heart className="h-4 w-4" />
                    {reactionCounts['heart']?.count > 0 && reactionCounts['heart'].count}
                  </Button>

                  <Button
                    variant={hasUserReacted(recognition.id, 'award') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleReaction(recognition.id, 'award')}
                    className="gap-1"
                  >
                    <Award className="h-4 w-4" />
                    {reactionCounts['award']?.count > 0 && reactionCounts['award'].count}
                  </Button>
                </div>

                {/* Delete button (only for sender) */}
                {isCurrentUserSender && (
                  <div>
                    {showDeleteConfirm === recognition.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRecognition(recognition.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(recognition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default RecognitionFeed;
