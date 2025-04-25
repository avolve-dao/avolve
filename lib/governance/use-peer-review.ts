import { useCallback, useState } from 'react';
import { PeerReview } from './types';
import { createClient } from '../supabase/client';

export function usePeerReview() {
  const supabase = createClient();
  const [peerReviews, setPeerReviews] = useState<Record<string, PeerReview[]>>({});

  const loadPeerReviews = useCallback(
    async (circleId: string) => {
      const { data, error } = await supabase
        .from('peer_reviews')
        .select('*')
        .eq('circle_id', circleId);
      if (!error && data) setPeerReviews(reviews => ({ ...reviews, [circleId]: data }));
    },
    [supabase]
  );

  const submitReview = useCallback(
    async ({
      circleId,
      revieweeId,
      feedback,
      score,
    }: {
      circleId: string;
      revieweeId: string;
      feedback: string;
      score: number;
    }) => {
      await supabase
        .from('peer_reviews')
        .insert({ circle_id: circleId, reviewee_id: revieweeId, feedback, score });
      await loadPeerReviews(circleId);
    },
    [supabase, loadPeerReviews]
  );

  return {
    peerReviews,
    loadPeerReviews,
    submitReview,
  };
}
