export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          mood_emoji: string;
          content: string;
          ai_summary: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          mood_emoji: string;
          content: string;
          ai_summary?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          mood_emoji?: string;
          content?: string;
          ai_summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Entry = Database["public"]["Tables"]["entries"]["Row"];
export type EntryInsert = Database["public"]["Tables"]["entries"]["Insert"];
export type EntryUpdate = Database["public"]["Tables"]["entries"]["Update"];

