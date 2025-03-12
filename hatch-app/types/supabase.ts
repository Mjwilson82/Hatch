export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      ideas: {
        Row: {
          id: string
          user_id: string
          text: string
          excitement: number
          difficulty: number
          created_at: string
          tags: string[]
          category: string | null
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          excitement: number
          difficulty: number
          created_at?: string
          tags?: string[]
          category?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          excitement?: number
          difficulty?: number
          created_at?: string
          tags?: string[]
          category?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          is_premium: boolean
          idea_count: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          is_premium?: boolean
          idea_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_premium?: boolean
          idea_count?: number
          created_at?: string
        }
      }
    }
  }
}

