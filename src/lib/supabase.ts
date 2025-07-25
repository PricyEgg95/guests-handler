import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          status: 'no-response' | 'accepted' | 'declined';
          table_number: number | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          status?: 'no-response' | 'accepted' | 'declined';
          table_number?: number | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          status?: 'no-response' | 'accepted' | 'declined';
          table_number?: number | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          name: string;
          capacity: number;
          position: { x: number; y: number };
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          capacity: number;
          position: { x: number; y: number };
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          capacity?: number;
          position?: { x: number; y: number };
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};