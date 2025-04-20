export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assists: {
        Row: {
          assisted_at: string | null
          description: string | null
          helper_id: string | null
          id: string
          recipient_id: string | null
        }
        Insert: {
          assisted_at?: string | null
          description?: string | null
          helper_id?: string | null
          id?: string
          recipient_id?: string | null
        }
        Update: {
          assisted_at?: string | null
          description?: string | null
          helper_id?: string | null
          id?: string
          recipient_id?: string | null
        }
        Relationships: []
      }
      business_success_puzzle: {
        Row: {
          back_stage_score: number | null
          bottom_line_score: number | null
          created_at: string
          front_stage_score: number | null
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back_stage_score?: number | null
          bottom_line_score?: number | null
          created_at?: string
          front_stage_score?: number | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back_stage_score?: number | null
          bottom_line_score?: number | null
          created_at?: string
          front_stage_score?: number | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      canvas_entries: {
        Row: {
          canvas_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          pillar: string
          title: string
          updated_at: string | null
        }
        Insert: {
          canvas_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pillar: string
          title: string
          updated_at?: string | null
        }
        Update: {
          canvas_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pillar?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_milestones: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          current: number
          description: string | null
          id: string
          name: string
          reward: string | null
          target: number
          updated_at: string | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          current?: number
          description?: string | null
          id?: string
          name: string
          reward?: string | null
          target: number
          updated_at?: string | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          current?: number
          description?: string | null
          id?: string
          name?: string
          reward?: string | null
          target?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      component_progress: {
        Row: {
          component_description: string | null
          component_name: string
          created_at: string
          id: string
          read: boolean
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          component_description?: string | null
          component_name: string
          created_at?: string
          id?: string
          read?: boolean
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          component_description?: string | null
          component_name?: string
          created_at?: string
          id?: string
          read?: boolean
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experience_phases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          requirements: Json | null
          sequence: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          requirements?: Json | null
          sequence: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          requirements?: Json | null
          sequence?: number
          updated_at?: string
        }
        Relationships: []
      }
      experiment_participation: {
        Row: {
          experiment_name: string | null
          id: string
          participated_at: string | null
          result: string | null
          user_id: string | null
        }
        Insert: {
          experiment_name?: string | null
          id?: string
          participated_at?: string | null
          result?: string | null
          user_id?: string | null
        }
        Update: {
          experiment_name?: string | null
          id?: string
          participated_at?: string | null
          result?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      experiment_results: {
        Row: {
          created_at: string | null
          experiment_id: string | null
          id: string
          result_type: string | null
          user_id: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          experiment_id?: string | null
          id?: string
          result_type?: string | null
          user_id?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          experiment_id?: string | null
          id?: string
          result_type?: string | null
          user_id?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          canvas_entry_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          experiment_type: string
          id: string
          start_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          canvas_entry_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          experiment_type?: string
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          canvas_entry_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          experiment_type?: string
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_canvas_entry_id_fkey"
            columns: ["canvas_entry_id"]
            isOneToOne: false
            referencedRelation: "canvas_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      group_profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          regeneration_status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          regeneration_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          regeneration_status?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invite_code: string | null
          invited_by: string | null
          used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invite_code?: string | null
          invited_by?: string | null
          used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invite_code?: string | null
          invited_by?: string | null
          used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      learnings: {
        Row: {
          actionable_status: string
          context: Json | null
          created_at: string | null
          created_by: string | null
          details: string | null
          experiment_id: string | null
          id: string
          summary: string
        }
        Insert: {
          actionable_status?: string
          context?: Json | null
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          experiment_id?: string | null
          id?: string
          summary: string
        }
        Update: {
          actionable_status?: string
          context?: Json | null
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          experiment_id?: string | null
          id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "learnings_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_stories: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          story: string
          tags: string[] | null
          title: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          story: string
          tags?: string[] | null
          title: string
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          story?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          id: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          metric_value: number
          notes: string | null
          recorded_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          metric_value: number
          notes?: string | null
          recorded_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_type?: Database["public"]["Enums"]["metric_type"]
          metric_value?: number
          notes?: string | null
          recorded_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_contributions: {
        Row: {
          amount: number
          contributed_at: string | null
          id: string
          milestone_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          contributed_at?: string | null
          id?: string
          milestone_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          contributed_at?: string | null
          id?: string
          milestone_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_contributions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "community_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_success_puzzle: {
        Row: {
          created_at: string
          health_score: number | null
          id: string
          notes: string | null
          peace_score: number | null
          updated_at: string
          user_id: string
          wealth_score: number | null
        }
        Insert: {
          created_at?: string
          health_score?: number | null
          id?: string
          notes?: string | null
          peace_score?: number | null
          updated_at?: string
          user_id: string
          wealth_score?: number | null
        }
        Update: {
          created_at?: string
          health_score?: number | null
          id?: string
          notes?: string | null
          peace_score?: number | null
          updated_at?: string
          user_id?: string
          wealth_score?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          regeneration_status: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          regeneration_status?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          regeneration_status?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      quest_progress: {
        Row: {
          completed_at: string | null
          id: string
          quest_id: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quest_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          quest_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          pillar: string
          title: string
          token_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pillar: string
          title: string
          token_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pillar?: string
          title?: string
          token_type?: string | null
        }
        Relationships: []
      }
      supergenius_breakthroughs: {
        Row: {
          created_at: string
          enterprise_progress: number | null
          id: string
          industry_progress: number | null
          notes: string | null
          updated_at: string
          user_id: string
          venture_progress: number | null
        }
        Insert: {
          created_at?: string
          enterprise_progress?: number | null
          id?: string
          industry_progress?: number | null
          notes?: string | null
          updated_at?: string
          user_id: string
          venture_progress?: number | null
        }
        Update: {
          created_at?: string
          enterprise_progress?: number | null
          id?: string
          industry_progress?: number | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          venture_progress?: number | null
        }
        Relationships: []
      }
      superhuman_enhancements: {
        Row: {
          academy_progress: number | null
          created_at: string
          id: string
          institute_progress: number | null
          notes: string | null
          university_progress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academy_progress?: number | null
          created_at?: string
          id?: string
          institute_progress?: number | null
          notes?: string | null
          university_progress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academy_progress?: number | null
          created_at?: string
          id?: string
          institute_progress?: number | null
          notes?: string | null
          university_progress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supermind_superpowers: {
        Row: {
          action_plan: string | null
          created_at: string
          current_state: string | null
          desired_state: string | null
          id: string
          notes: string | null
          results: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_plan?: string | null
          created_at?: string
          current_state?: string | null
          desired_state?: string | null
          id?: string
          notes?: string | null
          results?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_plan?: string | null
          created_at?: string
          current_state?: string | null
          desired_state?: string | null
          id?: string
          notes?: string | null
          results?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      superpuzzle_developments: {
        Row: {
          academy_score: number | null
          company_score: number | null
          created_at: string
          ecosystem_score: number | null
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academy_score?: number | null
          company_score?: number | null
          created_at?: string
          ecosystem_score?: number | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academy_score?: number | null
          company_score?: number | null
          created_at?: string
          ecosystem_score?: number | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supersociety_advancements: {
        Row: {
          community_progress: number | null
          company_progress: number | null
          country_progress: number | null
          created_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          community_progress?: number | null
          company_progress?: number | null
          country_progress?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          community_progress?: number | null
          company_progress?: number | null
          country_progress?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      token_ownership: {
        Row: {
          balance: number
          token_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          token_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          token_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_ownership_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_ownership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          amount: number
          created_at: string
          id: string
          name: string
          source: string | null
          symbol: string
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          name?: string
          source?: string | null
          symbol?: string
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          source?: string | null
          symbol?: string
          token_type?: Database["public"]["Enums"]["token_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string | null
          id: string
          to_user_id: string | null
          token_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id?: string | null
          id?: string
          to_user_id?: string | null
          token_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string | null
          id?: string
          to_user_id?: string | null
          token_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_admin_stories: {
        Row: {
          author_id: string | null
          author_name: string
          avatar_url: string | null
          context: string | null
          created_at: string
          id: string
          story: string
          type: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          avatar_url?: string | null
          context?: string | null
          created_at?: string
          id?: string
          story: string
          type: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          avatar_url?: string | null
          context?: string | null
          created_at?: string
          id?: string
          story?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_admin_stories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          token_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          token_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          token_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balances_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          context: string | null
          created_at: string | null
          feedback: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_milestones: {
        Row: {
          achieved_at: string
          created_at: string
          id: string
          milestone_description: string | null
          milestone_name: string
          read: boolean
          user_id: string
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          id?: string
          milestone_description?: string | null
          milestone_name: string
          read?: boolean
          user_id: string
        }
        Update: {
          achieved_at?: string
          created_at?: string
          id?: string
          milestone_description?: string | null
          milestone_name?: string
          read?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_phase_milestones: {
        Row: {
          completed_at: string
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_phase_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_phase_transitions: {
        Row: {
          from_phase: string
          id: string
          to_phase: string
          transitioned_at: string
          user_id: string
        }
        Insert: {
          from_phase: string
          id?: string
          to_phase: string
          transitioned_at?: string
          user_id: string
        }
        Update: {
          from_phase?: string
          id?: string
          to_phase?: string
          transitioned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_phase_transitions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_activity: {
        Row: {
          action_type: string
          context: Json | null
          created_at: string | null
          id: string
          points: number
          role_type: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Insert: {
          action_type: string
          context?: Json | null
          created_at?: string | null
          id?: string
          points?: number
          role_type?: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Update: {
          action_type?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          points?: number
          role_type?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_role_points: {
        Row: {
          role_type: Database["public"]["Enums"]["user_role"] | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_role_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_progress: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      metric_type:
        | "engagement"
        | "retention"
        | "arpu"
        | "activation"
        | "conversion"
        | "growth"
        | "custom"
      token_type:
        | "GEN"
        | "SAP"
        | "SCQ"
        | "PSP"
        | "BSP"
        | "SMS"
        | "SPD"
        | "SHE"
        | "SSA"
        | "SBG"
      user_role:
        | "admin"
        | "user"
        | "superachiever"
        | "superachievers"
        | "supercivilization"
        | "guest"
        | "service_role"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      metric_type: [
        "engagement",
        "retention",
        "arpu",
        "activation",
        "conversion",
        "growth",
        "custom",
      ],
      token_type: [
        "GEN",
        "SAP",
        "SCQ",
        "PSP",
        "BSP",
        "SMS",
        "SPD",
        "SHE",
        "SSA",
        "SBG",
      ],
      user_role: [
        "admin",
        "user",
        "superachiever",
        "superachievers",
        "supercivilization",
        "guest",
        "service_role",
      ],
    },
  },
} as const
