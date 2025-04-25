import { Database } from '@/types/supabase';

export type JourneyFocus = 'personal' | 'business' | 'supermind';
export type JourneyType = 'superachiever' | 'superachievers' | 'supercivilization';
export type TokenType =
  | 'GEN'
  | 'SAP'
  | 'SCQ'
  | 'PSP'
  | 'BSP'
  | 'SMS'
  | 'SPD'
  | 'SHE'
  | 'SSA'
  | 'SGB';

export interface JourneyPost {
  id: string;
  user_id: string;
  content: string;
  journey_type: JourneyType;
  journey_focus: JourneyFocus;
  token_fee: number;
  token_rewards: Record<TokenType, number>;
  engagement_score: number;
  regen_score: number;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar_url: string;
    regen_level: number;
  };
}

export interface PostInteractions {
  likes: number;
  comments: number;
  shares: number;
  user_has_liked: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar_url: string;
    regen_level: number;
  };
}

export interface PostWithInteractions extends JourneyPost {
  interactions: PostInteractions;
}
