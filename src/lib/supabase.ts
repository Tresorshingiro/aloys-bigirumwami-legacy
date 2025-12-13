import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          short_description: string;
          description: string;
          price: number;
          cover_image: string | null;
          year: number;
          pages: number | null;
          language: string | null;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          short_description: string;
          description: string;
          price: number;
          cover_image?: string | null;
          year: number;
          pages?: number | null;
          language?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          short_description?: string;
          description?: string;
          price?: number;
          cover_image?: string | null;
          year?: number;
          pages?: number | null;
          language?: string | null;
          stock?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: 'pending' | 'processing' | 'completed' | 'cancelled';
          shipping_address: string;
          shipping_city: string;
          shipping_country: string;
          shipping_postal_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          shipping_address: string;
          shipping_city: string;
          shipping_country: string;
          shipping_postal_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          shipping_address?: string;
          shipping_city?: string;
          shipping_country?: string;
          shipping_postal_code?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          book_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          book_id: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          book_id?: string;
          quantity?: number;
          price?: number;
        };
      };
    };
  };
}
