import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Please check SUPABASE_SETUP.md for setup instructions.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Database types for our presentation system
export interface Database {
  public: {
    Tables: {
      presentations: {
        Row: {
          id: number
          title: string
          workspace: string
          created_at: string
          updated_at: string
          user_id?: string
        }
        Insert: {
          id?: number
          title: string
          workspace: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: number
          title?: string
          workspace?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      slides: {
        Row: {
          id: number
          presentation_id: number
          slide_index: number
          slide_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          presentation_id: number
          slide_index: number
          slide_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          presentation_id?: number
          slide_index?: number
          slide_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      blocks: {
        Row: {
          id: number
          slide_id: number
          block_index: number
          block_type: string
          props: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slide_id: number
          block_index: number
          block_type: string
          props: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slide_id?: number
          block_index?: number
          block_type?: string
          props?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          presentation_id: number
          role: string
          content: string
          presentation_data?: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          presentation_id: number
          role: string
          content: string
          presentation_data?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          presentation_id?: number
          role?: string
          content?: string
          presentation_data?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
