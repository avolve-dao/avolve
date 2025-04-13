/**
 * Database Types
 * 
 * This file contains TypeScript types for the Supabase database schema.
 * It defines the structure of tables and their relationships.
 */

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
      challenge_completions: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          token_id: string
          amount: number
          streak_multiplier: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          token_id: string
          amount: number
          streak_multiplier: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          token_id?: string
          amount?: number
          streak_multiplier?: number
          completed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_token_id_fkey"
            columns: ["token_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          token_type: string
          difficulty: number
          day_of_week: number
          base_reward: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          token_type: string
          difficulty: number
          day_of_week: number
          base_reward: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          token_type?: string
          difficulty?: number
          day_of_week?: number
          base_reward?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_token_type_fkey"
            columns: ["token_type"]
            referencedRelation: "token_types"
            referencedColumns: ["id"]
          }
        ]
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          description: string
          enabled: boolean
          is_active: boolean
          percentage_rollout: number | null
          user_group_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          enabled?: boolean
          is_active?: boolean
          percentage_rollout?: number | null
          user_group_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          enabled?: boolean
          is_active?: boolean
          percentage_rollout?: number | null
          user_group_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      archived_transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string | null
          token_id: string | null
          amount: number
          reason: string | null
          challenge_id: string | null
          transaction_type: string
          status: string
          created_at: string
          updated_at: string
          archived_at: string
        }
        Insert: {
          id: string
          from_user_id?: string | null
          to_user_id?: string | null
          token_id?: string | null
          amount: number
          reason?: string | null
          challenge_id?: string | null
          transaction_type: string
          status: string
          created_at: string
          updated_at: string
          archived_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          token_id?: string | null
          amount?: number
          reason?: string | null
          challenge_id?: string | null
          transaction_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          archived_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archived_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archived_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archived_transactions_token_id_fkey"
            columns: ["token_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          }
        ]
      }
      invitation_codes: {
        Row: {
          id: string
          code: string
          created_by_user_id: string | null
          used_by_user_id: string | null
          is_used: boolean
          max_uses: number
          current_uses: number
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          created_by_user_id?: string | null
          used_by_user_id?: string | null
          is_used?: boolean
          max_uses?: number
          current_uses?: number
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          created_by_user_id?: string | null
          used_by_user_id?: string | null
          is_used?: boolean
          max_uses?: number
          current_uses?: number
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_codes_used_by_user_id_fkey"
            columns: ["used_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_claim_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_claim_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_claim_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      database_health: {
        Row: {
          id: string
          timestamp: string
          metric_name: string
          metric_value: number
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          timestamp?: string
          metric_name: string
          metric_value: number
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          metric_name?: string
          metric_value?: number
          details?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          token_type: string
          current_streak: number
          longest_streak: number
          last_claimed: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_type: string
          current_streak?: number
          longest_streak?: number
          last_claimed?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_type?: string
          current_streak?: number
          longest_streak?: number
          last_claimed?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_token_type_fkey"
            columns: ["token_type"]
            referencedRelation: "token_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      token_types: {
        Row: {
          id: string
          name: string
          symbol: string
          description: string | null
          parent_token_type_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          description?: string | null
          parent_token_type_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
          description?: string | null
          parent_token_type_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_types_parent_token_type_id_fkey"
            columns: ["parent_token_type_id"]
            referencedRelation: "token_types"
            referencedColumns: ["id"]
          }
        ]
      }
      tokens: {
        Row: {
          id: string
          name: string
          symbol: string
          description: string | null
          token_type_id: string
          is_active: boolean
          is_transferable: boolean
          transfer_fee_percentage: number | null
          gradient_class: string | null
          parent_id: string | null
          token_level: number
          is_tesla_369: boolean
          digital_root: number | null
          fibonacci_weight: number | null
          golden_ratio_multiplier: number | null
          total_supply: number | null
          token_type: string
          is_locked: boolean
          claim_day: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          description?: string | null
          token_type_id: string
          is_active?: boolean
          is_transferable?: boolean
          transfer_fee_percentage?: number | null
          gradient_class?: string | null
          parent_id?: string | null
          token_level?: number
          is_tesla_369?: boolean
          digital_root?: number | null
          fibonacci_weight?: number | null
          golden_ratio_multiplier?: number | null
          total_supply?: number | null
          token_type?: string
          is_locked?: boolean
          claim_day?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
          description?: string | null
          token_type_id?: string
          is_active?: boolean
          is_transferable?: boolean
          transfer_fee_percentage?: number | null
          gradient_class?: string | null
          parent_id?: string | null
          token_level?: number
          is_tesla_369?: boolean
          digital_root?: number | null
          fibonacci_weight?: number | null
          golden_ratio_multiplier?: number | null
          total_supply?: number | null
          token_type?: string
          is_locked?: boolean
          claim_day?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_token_type_id_fkey"
            columns: ["token_type_id"]
            referencedRelation: "token_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          }
        ]
      }
      token_transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string
          token_id: string
          amount: number
          reason: string | null
          challenge_id: string | null
          transaction_type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_user_id: string
          token_id: string
          amount: number
          reason?: string | null
          challenge_id?: string | null
          transaction_type: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string
          token_id?: string
          amount?: number
          reason?: string | null
          challenge_id?: string | null
          transaction_type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_token_id_fkey"
            columns: ["token_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          }
        ]
      }
      user_balances: {
        Row: {
          id: string
          user_id: string
          token_id: string
          balance: number
          staked_balance: number
          pending_release: number
          created_at: string
          updated_at: string
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          token_id: string
          balance?: number
          staked_balance?: number
          pending_release?: number
          created_at?: string
          updated_at?: string
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_id?: string
          balance?: number
          staked_balance?: number
          pending_release?: number
          created_at?: string
          updated_at?: string
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balances_token_id_fkey"
            columns: ["token_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_balances_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_token_balances_view: {
        Row: {
          user_id: string
          token_id: string
          symbol: string
          name: string
          gradient_class: string
          token_level: number
          parent_id: string | null
          balance: number
          staked_balance: number
          pending_release: number
          claim_day: string | null
          last_updated: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balances_token_id_fkey"
            columns: ["token_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_balances_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      claim_daily_token: {
        Args: {
          p_user_id: string
          p_challenge_id: string
          p_amount: number
          p_multiplier?: number
        }
        Returns: Json
      }
      transfer_tokens: {
        Args: {
          p_from_user_id: string
          p_to_user_id: string
          p_token_id: string
          p_amount: number
          p_reason?: string
        }
        Returns: Json
      }
      get_user_token_analytics: {
        Args: {
          p_user_id: string
          p_days_back?: number
        }
        Returns: Json
      }
      refresh_materialized_views: {
        Args: Record<string, never>
        Returns: void
      }
      collect_database_metrics: {
        Args: Record<string, never>
        Returns: void
      }
      generate_database_health_report: {
        Args: {
          p_hours_back?: number
        }
        Returns: Json
      }
      run_database_maintenance: {
        Args: {
          p_days_old?: number
        }
        Returns: Json
      }
      refresh_token_balances_view: {
        Args: Record<string, never>
        Returns: unknown
      }
    }
    Enums: {
      day_of_week_enum: 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'NONE'
      token_type: 'GEN' | 'SAP' | 'SCQ' | 'PSP' | 'BSP' | 'SMS' | 'SPD' | 'SHE' | 'SSA' | 'SGB'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
