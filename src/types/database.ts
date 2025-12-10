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
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          rating_avg: number
          rating_count: number
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string | null
          rating_avg?: number
          rating_count?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          rating_avg?: number
          rating_count?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      game_categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          image_url?: string | null
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          description: string
          price: number
          status: 'active' | 'reserved' | 'sold' | 'cancelled'
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          description: string
          price: number
          status?: 'active' | 'reserved' | 'sold' | 'cancelled'
          images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          description?: string
          price?: number
          status?: 'active' | 'reserved' | 'sold' | 'cancelled'
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string
          seller_id?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          completed_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          transaction_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          transaction_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type GameCategory = Database['public']['Tables']['game_categories']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

export type ListingWithSeller = Listing & {
  seller: User
  category: GameCategory | null
}

export type TransactionWithDetails = Transaction & {
  listing: Listing
  buyer: User
  seller: User
}

export type MessageWithSender = Message & {
  sender: User
}

export type ReviewWithReviewer = Review & {
  reviewer: User
}
