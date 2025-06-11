export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          reputation: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          reputation?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          reputation?: number
          created_at?: string
          updated_at?: string
        }
      }
      problems: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category_id: string | null
          status: 'open' | 'in_progress' | 'solved' | 'closed'
          is_public: boolean
          created_at: string
          updated_at: string
          solved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category_id?: string | null
          status?: 'open' | 'in_progress' | 'solved' | 'closed'
          is_public?: boolean
          created_at?: string
          updated_at?: string
          solved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category_id?: string | null
          status?: 'open' | 'in_progress' | 'solved' | 'closed'
          is_public?: boolean
          created_at?: string
          updated_at?: string
          solved_at?: string | null
        }
      }
      problem_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      problem_tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      problem_tag_relations: {
        Row: {
          problem_id: string
          tag_id: string
        }
        Insert: {
          problem_id: string
          tag_id: string
        }
        Update: {
          problem_id?: string
          tag_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      problem_bookmarks: {
        Row: {
          user_id: string
          problem_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          problem_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          problem_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      problem_suggestions: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          content: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          user_id: string
          content: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          user_id?: string
          content?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      problem_reports: {
        Row: {
          id: string
          problem_id: string
          reporter_id: string
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          reporter_id: string
          reason: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          reporter_id?: string
          reason?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 