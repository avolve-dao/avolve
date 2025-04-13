export type Database = {
  public: {
    Tables: {
      user_onboarding: {
        Row: {
          id: string
          user_id: string
          stage: 'welcome' | 'profile_setup' | 'focus_selection' | 'token_introduction' | 'complete'
          preferences: {
            notifications: boolean
            theme: 'light' | 'dark' | 'system'
            language: string
          }
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          user_id: string
          stage?: 'welcome' | 'profile_setup' | 'focus_selection' | 'token_introduction' | 'complete'
          preferences?: {
            notifications?: boolean
            theme?: 'light' | 'dark' | 'system'
            language?: string
          }
        }
        Update: {
          stage?: 'welcome' | 'profile_setup' | 'focus_selection' | 'token_introduction' | 'complete'
          preferences?: {
            notifications?: boolean
            theme?: 'light' | 'dark' | 'system'
            language?: string
          }
          completed_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'super' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'super' | 'admin'
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'super' | 'admin'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      initialize_onboarding: {
        Args: { user_id: string }
        Returns: void
      }
      advance_onboarding_stage: {
        Args: { 
          user_id: string
          new_stage: 'welcome' | 'profile_setup' | 'focus_selection' | 'token_introduction' | 'complete'
        }
        Returns: void
      }
      get_onboarding_state: {
        Args: { user_id: string }
        Returns: {
          stage: 'welcome' | 'profile_setup' | 'focus_selection' | 'token_introduction' | 'complete'
          preferences: {
            notifications: boolean
            theme: 'light' | 'dark' | 'system'
            language: string
          }
          created_at: string
          updated_at: string
          completed_at: string | null
        }
      }
    }
    Enums: {
      onboarding_stage: 'welcome' | 'profile_setup' | 'focus_selection' | 'token_introduction' | 'complete'
      user_role: 'user' | 'super' | 'admin'
    }
  }
}
