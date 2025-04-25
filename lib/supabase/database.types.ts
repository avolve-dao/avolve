/**
 * Database Types
 *
 * This file contains TypeScript types for the Supabase database schema.
 * It defines the structure of tables and their relationships.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      challenge_completions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          token_id: string;
          amount: number;
          streak_multiplier: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          token_id: string;
          amount: number;
          streak_multiplier: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          token_id?: string;
          amount?: number;
          streak_multiplier?: number;
          completed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'challenge_completions_challenge_id_fkey';
            columns: ['challenge_id'];
            referencedRelation: 'challenges';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'challenge_completions_token_id_fkey';
            columns: ['token_id'];
            referencedRelation: 'tokens';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'challenge_completions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          token_type: string;
          difficulty: number;
          day_of_week: number;
          base_reward: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          token_type: string;
          difficulty: number;
          day_of_week: number;
          base_reward: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          token_type?: string;
          difficulty?: number;
          day_of_week?: number;
          base_reward?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'challenges_token_type_fkey';
            columns: ['token_type'];
            referencedRelation: 'token_types';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flags: {
        Row: {
          id: string;
          name: string;
          description: string;
          enabled: boolean;
          is_active: boolean;
          percentage_rollout: number | null;
          user_group_ids: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          enabled?: boolean;
          is_active?: boolean;
          percentage_rollout?: number | null;
          user_group_ids?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          enabled?: boolean;
          is_active?: boolean;
          percentage_rollout?: number | null;
          user_group_ids?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      metrics: {
        Row: {
          id: string;
          user_id: string | null;
          metric_type: string;
          metric_value: number;
          recorded_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          event: string;
          timestamp: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          metric_type?: string;
          metric_value?: number;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          event: string;
          timestamp?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          metric_type?: string;
          metric_value?: number;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          event?: string;
          timestamp?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'metrics_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      peer_recognition: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          message: string;
          badge: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          message: string;
          badge?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          message?: string;
          badge?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'peer_recognition_recipient_id_fkey';
            columns: ['recipient_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'peer_recognition_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          user_email: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          regeneration_status: string | null;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          user_email: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          regeneration_status?: string | null;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          user_email?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          regeneration_status?: string | null;
          is_admin?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      recognition_reactions: {
        Row: {
          id: string;
          recognition_id: string;
          user_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recognition_id: string;
          user_id: string;
          reaction_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recognition_id?: string;
          user_id?: string;
          reaction_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recognition_reactions_recognition_id_fkey';
            columns: ['recognition_id'];
            referencedRelation: 'peer_recognition';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recognition_reactions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tokens: {
        Row: {
          id: string;
          user_id: string;
          token_type: string;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_type: string;
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_type?: string;
          amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tokens_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      token_types: {
        Row: {
          id: string;
          name: string;
          description: string;
          symbol: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          symbol: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          symbol?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitation_codes: {
        Row: {
          id: string;
          code: string;
          email: string | null;
          is_used: boolean;
          used_by: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          email?: string | null;
          is_used?: boolean;
          used_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          email?: string | null;
          is_used?: boolean;
          used_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invitation_codes_used_by_fkey';
            columns: ['used_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_phase_milestones: {
        Row: {
          id: string;
          user_id: string;
          phase: number;
          milestone_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phase: number;
          milestone_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phase?: number;
          milestone_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_phase_milestones_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          streak_type: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          streak_type: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          streak_type?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_streaks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      database_health: {
        Row: {
          id: string;
          check_name: string;
          status: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          check_name: string;
          status: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          check_name?: string;
          status?: string;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          id: string;
          name: string;
          description: string;
          streak_type: string;
          reward_token_id: string;
          base_reward: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          streak_type: string;
          reward_token_id: string;
          base_reward: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          streak_type?: string;
          reward_token_id?: string;
          base_reward?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'streaks_reward_token_id_fkey';
            columns: ['reward_token_id'];
            referencedRelation: 'tokens';
            referencedColumns: ['id'];
          },
        ];
      };
      token_transactions: {
        Row: {
          id: string;
          from_user_id: string | null;
          to_user_id: string | null;
          token_id: string | null;
          amount: number;
          transaction_type: string;
          reason: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          from_user_id?: string | null;
          to_user_id?: string | null;
          token_id?: string | null;
          amount: number;
          transaction_type: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          from_user_id?: string | null;
          to_user_id?: string | null;
          token_id?: string | null;
          amount?: number;
          transaction_type?: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'token_transactions_from_user_id_fkey';
            columns: ['from_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'token_transactions_to_user_id_fkey';
            columns: ['to_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'token_transactions_token_id_fkey';
            columns: ['token_id'];
            referencedRelation: 'tokens';
            referencedColumns: ['id'];
          },
        ];
      };
      archived_transactions: {
        Row: {
          id: string;
          transaction_data: Json;
          archived_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_data: Json;
          archived_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_data?: Json;
          archived_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_balances: {
        Row: {
          id: string;
          user_id: string;
          token_id: string;
          balance: number;
          staked_balance: number;
          pending_release: number;
          created_at: string;
          updated_at: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_id: string;
          balance: number;
          staked_balance: number;
          pending_release: number;
          created_at?: string;
          updated_at?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_id?: string;
          balance?: number;
          staked_balance?: number;
          pending_release?: number;
          created_at?: string;
          updated_at?: string;
          last_updated?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_balances_token_id_fkey';
            columns: ['token_id'];
            referencedRelation: 'tokens';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_balances_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_token_balances_view: {
        Row: {
          user_id: string;
          token_id: string;
          symbol: string;
          name: string;
          gradient_class: string;
          token_level: number;
          parent_id: string | null;
          balance: number;
          staked_balance: number;
          pending_release: number;
          claim_day: string | null;
          last_updated: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_balances_token_id_fkey';
            columns: ['token_id'];
            referencedRelation: 'tokens';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_balances_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tokens_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'tokens';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      claim_daily_token: {
        Args: {
          p_user_id: string;
          p_challenge_id: string;
          p_amount: number;
          p_multiplier?: number;
        };
        Returns: Json;
      };
      transfer_tokens: {
        Args: {
          p_from_user_id: string;
          p_to_user_id: string;
          p_token_id: string;
          p_amount: number;
          p_reason?: string;
        };
        Returns: Json;
      };
      get_user_token_analytics: {
        Args: {
          p_user_id: string;
          p_days_back?: number;
        };
        Returns: Json;
      };
      get_user_token_balances: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          token_type: string;
          balance: number;
        }[];
      };
      initialize_user_onboarding: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      refresh_materialized_views: {
        Args: Record<string, never>;
        Returns: void;
      };
      collect_database_metrics: {
        Args: Record<string, never>;
        Returns: void;
      };
      generate_database_health_report: {
        Args: {
          p_hours_back?: number;
        };
        Returns: Json;
      };
      run_database_maintenance: {
        Args: {
          p_days_old?: number;
        };
        Returns: Json;
      };
      refresh_token_balances_view: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      day_of_week_enum: 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'NONE';
      token_type: 'GEN' | 'SAP' | 'SCQ' | 'PSP' | 'BSP' | 'SMS' | 'SPD' | 'SHE' | 'SSA' | 'SGB';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
