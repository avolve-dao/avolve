// This file is auto-generated. Do not edit manually.
// Generated from Supabase MCP production project.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      assists: {
        Row: {
          assisted_at: string | null;
          description: string | null;
          helper_id: string | null;
          id: string;
          recipient_id: string | null;
        };
        Insert: {
          assisted_at?: string | null;
          description?: string | null;
          helper_id?: string | null;
          id?: string;
          recipient_id?: string | null;
        };
        Update: {
          assisted_at?: string | null;
          description?: string | null;
          helper_id?: string | null;
          id?: string;
          recipient_id?: string | null;
        };
        Relationships: [];
      };
      business_success_puzzle: {
        Row: {
          back_stage_score: number | null;
          bottom_line_score: number | null;
          created_at: string;
          front_stage_score: number | null;
          id: string;
          notes: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          back_stage_score?: number | null;
          bottom_line_score?: number | null;
          created_at?: string;
          front_stage_score?: number | null;
          id?: string;
          notes?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          back_stage_score?: number | null;
          bottom_line_score?: number | null;
          created_at?: string;
          front_stage_score?: number | null;
          id?: string;
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      canvas_entries: {
        Row: {
          canvas_type: string;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          owner_id: string | null;
          title: string | null;
        };
        Insert: {
          canvas_type: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          owner_id?: string | null;
          title?: string | null;
        };
        Update: {
          canvas_type?: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          owner_id?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          awarded_at: string;
          category: string;
          data: Json | null;
          description: string | null;
          id: string;
          type: string;
          user_id: string;
        };
        Insert: {
          awarded_at?: string;
          category: string;
          data?: Json | null;
          description?: string | null;
          id?: string;
          type: string;
          user_id: string;
        };
        Update: {
          awarded_at?: string;
          category?: string;
          data?: Json | null;
          description?: string | null;
          id?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'achievements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tokens: {
        Row: {
          id: string;
          symbol: string;
          name: string;
          description: string | null;
          transferable: boolean | null;
        };
        Insert: {
          id?: string;
          symbol: string;
          name: string;
          description?: string | null;
          transferable?: boolean | null;
        };
        Update: {
          id?: string;
          symbol?: string;
          name?: string;
          description?: string | null;
          transferable?: boolean | null;
        };
        Relationships: [];
      };
      user_activity_log: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          activity_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          activity_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          activity_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_activity_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      // ... (rest of the types truncated for brevity)
    };
  };
};
// ... (rest of the generated types and constants)
