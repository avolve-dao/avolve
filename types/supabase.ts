export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string | null
          id: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string | null
          id?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string | null
          id?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_pageviews: {
        Row: {
          created_at: string | null
          id: string
          referrer: string | null
          timestamp: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referrer?: string | null
          timestamp?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referrer?: string | null
          timestamp?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string | null
          cooldown_hours: number | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_repeatable: boolean | null
          requirements: Json | null
          title: string | null
          token_reward: number | null
        }
        Insert: {
          challenge_type?: string | null
          cooldown_hours?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_repeatable?: boolean | null
          requirements?: Json | null
          title?: string | null
          token_reward?: number | null
        }
        Update: {
          challenge_type?: string | null
          cooldown_hours?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_repeatable?: boolean | null
          requirements?: Json | null
          title?: string | null
          token_reward?: number | null
        }
        Relationships: []
      }
      genie_conversations: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          message_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genie_conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_requests: {
        Row: {
          approved_at: string | null
          created_at: string | null
          email: string | null
          id: string
          reason: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          is_direct: boolean
          recipient_id: string | null
          room_id: string | null
          sender_id: string
          sender_name: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_direct?: boolean
          recipient_id?: string | null
          room_id?: string | null
          sender_id: string
          sender_name?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_direct?: boolean
          recipient_id?: string | null
          room_id?: string | null
          sender_id?: string
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agreement_date: string | null
          agreement_version: string | null
          bio: string | null
          business_goals: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gen_tokens: number
          has_agreed_to_terms: boolean
          has_genie_ai: boolean
          has_genius_id: boolean
          has_gen_tokens: boolean
          id: string
          personal_goals: string | null
          regen_commitment: string | null
          role: string | null
          supermind_goals: string | null
          updated_at: string | null
          username: string | null
          value_created: number | null
          value_goal: number | null
        }
        Insert: {
          agreement_date?: string | null
          agreement_version?: string | null
          bio?: string | null
          business_goals?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gen_tokens?: number
          has_agreed_to_terms?: boolean
          has_genie_ai?: boolean
          has_genius_id?: boolean
          has_gen_tokens?: boolean
          id: string
          personal_goals?: string | null
          regen_commitment?: string | null
          role?: string | null
          supermind_goals?: string | null
          updated_at?: string | null
          username?: string | null
          value_created?: number | null
          value_goal?: number | null
        }
        Update: {
          agreement_date?: string | null
          agreement_version?: string | null
          bio?: string | null
          business_goals?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gen_tokens?: number
          has_agreed_to_terms?: boolean
          has_genie_ai?: boolean
          has_genius_id?: boolean
          has_gen_tokens?: boolean
          id?: string
          personal_goals?: string | null
          regen_commitment?: string | null
          role?: string | null
          supermind_goals?: string | null
          updated_at?: string | null
          username?: string | null
          value_created?: number | null
          value_goal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          progress: Json | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: Json | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      value_creation: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "value_creation_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_value_metrics: {
        Args: {
          p_user_id: string
          p_days: number
        }
        Returns: {
          date: string
          total_value: number
        }[]
      }
      increment_user_value: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
export type Functions<T extends keyof Database["public"]["Functions"]> = Database["public"]["Functions"][T]

// Helper types for common operations
export type Profile = Tables<"profiles">
export type Message = Tables<"messages">
export type Challenge = Tables<"challenges">
export type UserChallenge = Tables<"user_challenges">
export type ValueCreation = Tables<"value_creation">
export type GenieConversation = Tables<"genie_conversations">
