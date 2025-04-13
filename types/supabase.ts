export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      experience_phases: {
        Row: {
          id: string
          name: string
          description: string
          sequence: number
          requirements: Json
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          sequence: number
          requirements?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          sequence?: number
          requirements?: Json
          created_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          symbol: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id: string
          symbol: string
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string
          token_id: string
          amount: number
          transaction_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_user_id: string
          token_id: string
          amount: number
          transaction_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string
          token_id?: string
          amount?: number
          transaction_type?: string
          description?: string | null
          created_at?: string
        }
      }
      user_balances: {
        Row: {
          user_id: string
          token_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          token_id: string
          balance: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          token_id?: string
          balance?: number
          updated_at?: string
        }
      }
      user_phase_milestones: {
        Row: {
          user_id: string
          milestone_id: string
          completed_at: string
        }
        Insert: {
          user_id: string
          milestone_id: string
          completed_at?: string
        }
        Update: {
          user_id?: string
          milestone_id?: string
          completed_at?: string
        }
      }
      user_phase_transitions: {
        Row: {
          id: string
          user_id: string
          from_phase: string
          to_phase: string
          transitioned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          from_phase: string
          to_phase: string
          transitioned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          from_phase?: string
          to_phase?: string
          transitioned_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          completed: boolean
          claimed: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          completed?: boolean
          claimed?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          completed?: boolean
          claimed?: boolean
          updated_at?: string
        }
      }
      user_token_streaks: {
        Row: {
          id: string
          user_id: string
          token_symbol: string
          current_streak: number
          longest_streak: number
          last_claim_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_symbol: string
          current_streak?: number
          longest_streak?: number
          last_claim_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_symbol?: string
          current_streak?: number
          longest_streak?: number
          last_claim_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_claims: {
        Row: {
          id: string
          user_id: string
          token_id: string
          claim_date: string
          amount: number
          streak_count: number
          streak_multiplier: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_id: string
          claim_date?: string
          amount: number
          streak_count?: number
          streak_multiplier?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_id?: string
          claim_date?: string
          amount?: number
          streak_count?: number
          streak_multiplier?: number
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          criteria: Json
          reward_type: string
          reward_amount: number
          badge_image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          criteria?: Json
          reward_type: string
          reward_amount: number
          badge_image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          criteria?: Json
          reward_type?: string
          reward_amount?: number
          badge_image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      regen_analytics_mv: {
        Row: {
          user_id: string
          regen_score: number
          regen_level: number
          next_level_threshold: number
        }
        Insert: {
          user_id: string
          regen_score: number
          regen_level: number
          next_level_threshold: number
        }
        Update: {
          user_id?: string
          regen_score?: number
          regen_level?: number
          next_level_threshold?: number
        }
      }
    }
    Views: {
      token_flow_rates: {
        Row: {
          user_id: string
          token_id: string
          flow_rate: number
        }
      }
    }
    Functions: {
      get_user_progress: {
        Args: {
          user_id_param: string
        }
        Returns: {
          user_id: string
          current_phase: string
          phase_sequence: number
          phase_progress: number
          total_tokens: number
        }
      }
      get_user_token_flow_rates: {
        Args: {
          user_id_param: string
        }
        Returns: {
          token_id: string
          flow_rate: number
        }[]
      }
      claim_achievement_reward: {
        Args: {
          user_achievement_id_param: string
          user_id_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}