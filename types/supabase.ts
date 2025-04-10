export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Token related types
export type TokenSymbol = 'GEN' | 'SAP' | 'PSP' | 'BSP' | 'SMS' | 'SCQ' | 'SPD' | 'SHE' | 'SSA' | 'SGB';

// Metric related types
export type MetricType = 'ACTIVITY' | 'ENGAGEMENT' | 'CONTRIBUTION' | 'LEARNING' | 'COMMUNITY';

// Team related types
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CONTRIBUTOR' | 'OBSERVER';
export type TeamChallengeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

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
      [_ in never]: never
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
    }
    Enums: {
      [_ in never]: never
    }
  }
}