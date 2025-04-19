// Types for Fractal Governance, Circles, Peer Review, and Reputation

export interface Circle {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  joined_at: string;
}

export interface PeerReview {
  id: string;
  circle_id: string;
  reviewer_id: string;
  reviewee_id: string;
  feedback: string;
  score: number;
  created_at: string;
}

export interface Reputation {
  user_id: string;
  individual_merit: number;
  collective_merit: number;
  ecosystem_merit: number;
  updated_at: string;
}
