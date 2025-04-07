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
      tokens: {
        Row: {
          id: string
          symbol: string
          name: string
          description: string | null
          icon_url: string | null
          gradient_class: string | null
          is_primary: boolean
          blockchain_contract: string | null
          chain_id: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          is_transferable: boolean
          parent_token_id: string | null
        }
        Insert: {
          id?: string
          symbol: string
          name: string
          description?: string | null
          icon_url?: string | null
          gradient_class?: string | null
          is_primary?: boolean
          blockchain_contract?: string | null
          chain_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          is_transferable?: boolean
          parent_token_id?: string | null
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          gradient_class?: string | null
          is_primary?: boolean
          blockchain_contract?: string | null
          chain_id?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          is_transferable?: boolean
          parent_token_id?: string | null
        }
      }
      user_psp_goals: {
        Row: {
          id: string
          user_id: string
          psp_area: string
          goal_description: string
          current_state: string | null
          desired_state: string | null
          is_active_mvp_goal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          psp_area: string
          goal_description: string
          current_state?: string | null
          desired_state?: string | null
          is_active_mvp_goal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          psp_area?: string
          goal_description?: string
          current_state?: string | null
          desired_state?: string | null
          is_active_mvp_goal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_quests: {
        Row: {
          user_id: string
          quest_type: string
          last_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          quest_type: string
          last_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          quest_type?: string
          last_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_tokens: {
        Row: {
          user_id: string
          token_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          token_id: string
          balance: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          token_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          code: string
          created_by: string | null
          email: string | null
          status: string
          created_at: string
          expires_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          code: string
          created_by?: string | null
          email?: string | null
          status?: string
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          created_by?: string | null
          email?: string | null
          status?: string
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
      }
      member_journey: {
        Row: {
          id: string
          user_id: string
          current_level: string
          invitation_id: string | null
          vouch_count: number
          contribution_count: number
          has_paid: boolean
          journey_started_at: string
          level_updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_level?: string
          invitation_id?: string | null
          vouch_count?: number
          contribution_count?: number
          has_paid?: boolean
          journey_started_at?: string
          level_updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_level?: string
          invitation_id?: string | null
          vouch_count?: number
          contribution_count?: number
          has_paid?: boolean
          journey_started_at?: string
          level_updated_at?: string
        }
      }
      vouches: {
        Row: {
          id: string
          voucher_id: string
          vouched_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          voucher_id: string
          vouched_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          voucher_id?: string
          vouched_user_id?: string
          created_at?: string
        }
      }
      contributions: {
        Row: {
          id: string
          user_id: string
          type: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          data?: Json
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          type: string
          data: Json
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          data?: Json
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          data?: Json
          unlocked_at?: string
        }
      }
      security_logs: {
        Row: {
          id: string
          user_id: string | null
          ip_address: string | null
          event_type: string
          severity: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          event_type: string
          severity: string
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          event_type?: string
          severity?: string
          details?: Json
          created_at?: string
        }
      }
      verification_challenge_types: {
        Row: {
          id: string
          name: string
          description: string
          difficulty: string
          points: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          difficulty: string
          points?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          difficulty?: string
          points?: number
          is_active?: boolean
          created_at?: string
        }
      }
      verification_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_type_id: string
          status: string
          data: Json
          response: Json | null
          points_earned: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          challenge_type_id: string
          status?: string
          data?: Json
          response?: Json | null
          points_earned?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          challenge_type_id?: string
          status?: string
          data?: Json
          response?: Json | null
          points_earned?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      trust_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          level: number
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          score?: number
          level?: number
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          level?: number
          last_updated?: string
        }
      }
      human_verifications: {
        Row: {
          id: string
          user_id: string
          verification_method: string
          verification_data: Json
          is_verified: boolean
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          verification_method: string
          verification_data?: Json
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          verification_method?: string
          verification_data?: Json
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
      }
      member_badges: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          requirements: Json
          points: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          requirements: Json
          points?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          requirements?: Json
          points?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      user_activity_log: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          page: string | null
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          page?: string | null
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          page?: string | null
          data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      users: {
        Row: {
          id: string
          email: string | null
          raw_user_meta_data: Json | null
          raw_app_meta_data: Json | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
    Functions: {
      complete_psp_weekly_checkin: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      process_token_transaction: {
        Args: {
          p_from_user_id: string | null
          p_to_user_id: string
          p_token_id: string
          p_amount: number
          p_transaction_type: string
        }
        Returns: undefined
      }
      check_invitation_code: {
        Args: {
          p_code: string
        }
        Returns: Json
      }
      create_invitation: {
        Args: {
          p_email: string | null
        }
        Returns: Json
      }
      accept_invitation: {
        Args: {
          p_code: string
        }
        Returns: Json
      }
      vouch_for_user: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      record_contribution: {
        Args: {
          p_contribution_type: string
          p_data: Json
        }
        Returns: Json
      }
      get_member_journey_status: {
        Args: Record<string, never>
        Returns: Json
      }
      assign_verification_challenges: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      complete_verification_challenge: {
        Args: {
          p_challenge_id: string
          p_response: Json
          p_success: boolean
        }
        Returns: Json
      }
      update_trust_score: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      check_and_award_badges: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      log_security_event: {
        Args: {
          p_user_id: string | null
          p_ip_address: string | null
          p_event_type: string
          p_severity: string
          p_details: Json
        }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_page: string | null
          p_data: Json
        }
        Returns: undefined
      }
    }
  }
}
