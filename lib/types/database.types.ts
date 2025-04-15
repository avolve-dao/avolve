/**
 * Avolve Platform Database Types
 * 
 * This file contains TypeScript interfaces for the Avolve platform database schema.
 * It provides type safety when interacting with the Supabase database.
 */

// Common status types
export type JourneyStatus = 'not_started' | 'in_progress' | 'completed';
export type ComponentType = 'lesson' | 'challenge' | 'assessment' | 'reflection';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ParticipantStatus = 'registered' | 'checked_in' | 'present' | 'absent';
export type GroupStatus = 'forming' | 'active' | 'completed';
export type NodeType = 'residence' | 'coworking' | 'event_space' | 'community_center';
export type NodeStatus = 'proposed' | 'fundraising' | 'under_development' | 'active' | 'inactive';
export type MembershipType = 'founder' | 'resident' | 'member' | 'visitor';
export type MembershipStatus = 'pending' | 'active' | 'inactive';
export type StakingStatus = 'active' | 'completed' | 'cancelled';
export type TransactionType = 'transfer' | 'reward' | 'mint' | 'burn' | 'stake' | 'unstake' | 'pending_release';
export type ActivityType = 'meeting_attendance' | 'meeting_contribution' | 'content_creation' | 'task_completion' | 'recruitment';

/**
 * Community Structure Types
 */

// Pillar - Main category (Superachiever, Superachievers, Supercivilization)
export interface Pillar {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_url: string | null;
  gradient_class: string;
  token_symbol: string;
  display_order: number;
  chain_id: string | null;
  created_at: string;
  updated_at: string;
}

// Route - Sub-category within a pillar (Personal, Business, Supermind, etc.)
export interface Route {
  id: string;
  pillar_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_url: string | null;
  gradient_class: string;
  token_symbol: string;
  day_of_week: number | null;
  chain_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Section - Components of routes
export interface Section {
  id: string;
  route_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Component - Atomic learning/interaction units
export interface Component {
  id: string;
  section_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  component_type: ComponentType;
  content: any | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// UserJourney - Tracks user progress through pillars and routes
export interface UserJourney {
  id: string;
  user_id: string;
  pillar_id: string;
  route_id: string | null;
  progress: number;
  status: JourneyStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// UserComponentProgress - Tracks user progress through components
export interface UserComponentProgress {
  id: string;
  user_id: string;
  component_id: string;
  current_state: any | null;
  desired_state: any | null;
  action_plan: any | null;
  results: any | null;
  status: JourneyStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// UserSectionProgress - Tracks user progress through sections
export interface UserSectionProgress {
  id: string;
  user_id: string;
  section_id: string;
  progress: number;
  status: JourneyStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Token Economy Types
 */

// Token - Currency in the Avolve ecosystem
export interface Token {
  id: string;
  symbol: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  gradient_class: string | null;
  total_supply: number;
  is_primary: boolean;
  blockchain_contract: string | null;
  chain_id: string | null;
  created_at: string;
  updated_at: string;
}

// UserToken - User's token balance
export interface UserToken {
  id: string;
  user_id: string;
  token_id: string;
  balance: number;
  staked_balance: number;
  pending_release: number;
  created_at: string;
  updated_at: string;
}

// TokenTransaction - Record of token transfers
export interface TokenTransaction {
  id: string;
  token_id: string;
  from_user_id: string | null;
  to_user_id: string | null;
  amount: number;
  transaction_type: TransactionType;
  reason: string | null;
  tx_hash: string | null;
  created_at: string;
}

// TokenReward - Configuration for token rewards
export interface TokenReward {
  id: string;
  token_id: string;
  activity_type: ActivityType;
  base_amount: number;
  multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// TokenStaking - Record of token staking
export interface TokenStaking {
  id: string;
  user_id: string;
  token_id: string;
  amount: number;
  lock_duration_days: number;
  start_date: string;
  end_date: string;
  status: StakingStatus;
  reward_rate: number;
  reward_amount: number;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Identity Types
 */

// GeniusProfile - User's identity in the Avolve ecosystem
export interface GeniusProfile {
  id: string;
  user_id: string;
  genius_id: string;
  degen_regen_score: number;
  chain_account: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_state: any | null;
  desired_state: any | null;
  action_plan: any | null;
  results: any | null;
  created_at: string;
  updated_at: string;
}

/**
 * Governance Types
 */

// WeeklyMeeting - Weekly meeting for a route
export interface WeeklyMeeting {
  id: string;
  route_id: string;
  title: string;
  description: string | null;
  start_time: string;
  duration_minutes: number;
  max_participants: number | null;
  status: MeetingStatus;
  webrtc_room_id: string | null;
  created_at: string;
  updated_at: string;
}

// MeetingGroup - Group within a meeting
export interface MeetingGroup {
  id: string;
  meeting_id: string;
  max_participants: number;
  current_participants: number;
  status: GroupStatus;
  webrtc_room_id: string | null;
  created_at: string;
  updated_at: string;
}

// MeetingParticipant - User participating in a meeting
export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  group_id: string | null;
  user_id: string;
  rank: number | null;
  respect_earned: number | null;
  status: ParticipantStatus;
  check_in_time: string | null;
  created_at: string;
  updated_at: string;
}

// MeetingNote - Note taken during a meeting
export interface MeetingNote {
  id: string;
  meeting_id: string;
  group_id: string | null;
  user_id: string;
  content: string;
  is_consensus: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Network Types
 */

// PhysicalNode - Physical location in the Avolve network
export interface PhysicalNode {
  id: string;
  name: string;
  description: string | null;
  node_type: NodeType;
  founder_id: string | null;
  latitude: number | null;
  longitude: number | null;
  address: any | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  size_sqm: number | null;
  capacity: number | null;
  occupation: number | null;
  status: NodeStatus;
  funding_goal: number | null;
  current_funding: number | null;
  chain_id: string | null;
  created_at: string;
  updated_at: string;
}

// NodeMembership - User's membership in a physical node
export interface NodeMembership {
  id: string;
  node_id: string;
  user_id: string;
  membership_type: MembershipType;
  start_date: string;
  end_date: string | null;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

// NodeFunding - Funding for a physical node
export interface NodeFunding {
  id: string;
  node_id: string;
  user_id: string;
  amount: number;
  token_id: string;
  funding_date: string;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

// NetworkCensus - Periodic census of the network
export interface NetworkCensus {
  id: string;
  census_date: string;
  total_nodes: number;
  total_members: number;
  total_funding: number;
  active_nodes: number;
  under_development_nodes: number;
  fundraising_nodes: number;
  proposed_nodes: number;
  census_data: any | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database schema type
 */
export interface Database {
  public: {
    Tables: {
      // Community Structure
      pillars: {
        Row: Pillar;
        Insert: Omit<Pillar, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Pillar, 'id' | 'created_at' | 'updated_at'>>;
      };
      routes: {
        Row: Route;
        Insert: Omit<Route, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Route, 'id' | 'created_at' | 'updated_at'>>;
      };
      sections: {
        Row: Section;
        Insert: Omit<Section, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Section, 'id' | 'created_at' | 'updated_at'>>;
      };
      components: {
        Row: Component;
        Insert: Omit<Component, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Component, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_journeys: {
        Row: UserJourney;
        Insert: Omit<UserJourney, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserJourney, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_component_progress: {
        Row: UserComponentProgress;
        Insert: Omit<UserComponentProgress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserComponentProgress, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_section_progress: {
        Row: UserSectionProgress;
        Insert: Omit<UserSectionProgress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSectionProgress, 'id' | 'created_at' | 'updated_at'>>;
      };
      
      // Token Economy
      tokens: {
        Row: Token;
        Insert: Omit<Token, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Token, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_tokens: {
        Row: UserToken;
        Insert: Omit<UserToken, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserToken, 'id' | 'created_at' | 'updated_at'>>;
      };
      token_transactions: {
        Row: TokenTransaction;
        Insert: Omit<TokenTransaction, 'id' | 'created_at'>;
        Update: Partial<Omit<TokenTransaction, 'id' | 'created_at'>>;
      };
      token_rewards: {
        Row: TokenReward;
        Insert: Omit<TokenReward, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TokenReward, 'id' | 'created_at' | 'updated_at'>>;
      };
      token_staking: {
        Row: TokenStaking;
        Insert: Omit<TokenStaking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TokenStaking, 'id' | 'created_at' | 'updated_at'>>;
      };
      
      // Identity
      genius_profiles: {
        Row: GeniusProfile;
        Insert: Omit<GeniusProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GeniusProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      
      // Governance
      weekly_meetings: {
        Row: WeeklyMeeting;
        Insert: Omit<WeeklyMeeting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WeeklyMeeting, 'id' | 'created_at' | 'updated_at'>>;
      };
      meeting_groups: {
        Row: MeetingGroup;
        Insert: Omit<MeetingGroup, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MeetingGroup, 'id' | 'created_at' | 'updated_at'>>;
      };
      meeting_participants: {
        Row: MeetingParticipant;
        Insert: Omit<MeetingParticipant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MeetingParticipant, 'id' | 'created_at' | 'updated_at'>>;
      };
      meeting_notes: {
        Row: MeetingNote;
        Insert: Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>>;
      };
      
      // Network
      physical_nodes: {
        Row: PhysicalNode;
        Insert: Omit<PhysicalNode, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PhysicalNode, 'id' | 'created_at' | 'updated_at'>>;
      };
      node_memberships: {
        Row: NodeMembership;
        Insert: Omit<NodeMembership, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NodeMembership, 'id' | 'created_at' | 'updated_at'>>;
      };
      node_funding: {
        Row: NodeFunding;
        Insert: Omit<NodeFunding, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NodeFunding, 'id' | 'created_at' | 'updated_at'>>;
      };
      network_census: {
        Row: NetworkCensus;
        Insert: Omit<NetworkCensus, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NetworkCensus, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      // Token Economy Functions
      reward_user: {
        Args: {
          p_user_id: string;
          p_token_symbol: string;
          p_activity_type: ActivityType;
          p_custom_amount?: number;
          p_custom_multiplier?: number;
        };
        Returns: number;
      };
      transfer_tokens: {
        Args: {
          p_from_user_id: string;
          p_to_user_id: string;
          p_token_symbol: string;
          p_amount: number;
          p_reason?: string;
        };
        Returns: boolean;
      };
      release_pending_tokens: {
        Args: Record<string, never>;
        Returns: void;
      };
      get_user_token_balances: {
        Args: {
          p_user_id: string;
        };
        Returns: any;
      };
      
      // Identity Functions
      create_genius_profile: {
        Args: {
          p_user_id: string;
          p_genius_id: string;
          p_avatar_url?: string;
          p_bio?: string;
        };
        Returns: string;
      };
      update_degen_regen_score: {
        Args: {
          p_user_id: string;
          p_score_change: number;
        };
        Returns: number;
      };
      
      // Governance Functions
      register_for_meeting: {
        Args: {
          p_user_id: string;
          p_meeting_id: string;
        };
        Returns: string;
      };
      distribute_meeting_respect: {
        Args: {
          p_meeting_id: string;
        };
        Returns: boolean;
      };
    };
  };
}
