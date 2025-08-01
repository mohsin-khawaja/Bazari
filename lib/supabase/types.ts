export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          first_name: string | null
          last_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          instagram: string | null
          twitter: string | null
          facebook: string | null
          phone: string | null
          account_type: "buyer" | "seller" | "both"
          email_verified: boolean
          phone_verified: boolean
          identity_verified: "pending" | "verified" | "rejected"
          seller_verified: "pending" | "verified" | "rejected"
          profile_public: boolean
          show_email: boolean
          show_phone: boolean
          show_location: boolean
          allow_messages: boolean
          show_online_status: boolean
          marketing_emails: boolean
          order_updates: boolean
          total_sales: number
          total_purchases: number
          rating: number
          rating_count: number
          followers_count: number
          following_count: number
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          facebook?: string | null
          phone?: string | null
          account_type?: "buyer" | "seller" | "both"
          email_verified?: boolean
          phone_verified?: boolean
          identity_verified?: "pending" | "verified" | "rejected"
          seller_verified?: "pending" | "verified" | "rejected"
          profile_public?: boolean
          show_email?: boolean
          show_phone?: boolean
          show_location?: boolean
          allow_messages?: boolean
          show_online_status?: boolean
          marketing_emails?: boolean
          order_updates?: boolean
        }
        Update: {
          username?: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          facebook?: string | null
          phone?: string | null
          account_type?: "buyer" | "seller" | "both"
          profile_public?: boolean
          show_email?: boolean
          show_phone?: boolean
          show_location?: boolean
          allow_messages?: boolean
          show_online_status?: boolean
          marketing_emails?: boolean
          order_updates?: boolean
        }
      }
      cultural_origins: {
        Row: {
          id: string
          name: string
          description: string | null
          region: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          region?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          region?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
        }
      }
      items: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string
          price: number
          original_price: number | null
          condition: "brand_new" | "like_new" | "gently_used" | "well_loved" | "vintage" | "custom_made" | "designer"
          size: string | null
          color: string | null
          gender: string | null
          occasion: string | null
          category_id: string | null
          cultural_origin_id: string | null
          status: "active" | "sold" | "inactive" | "pending_approval"
          featured: boolean
          on_sale: boolean
          free_shipping: boolean
          views_count: number
          likes_count: number
          saves_count: number
          tags: string[] | null
          created_at: string
          updated_at: string
          sold_at: string | null
        }
        Insert: {
          seller_id: string
          title: string
          description: string
          price: number
          original_price?: number | null
          condition: "brand_new" | "like_new" | "gently_used" | "well_loved" | "vintage" | "custom_made" | "designer"
          size?: string | null
          color?: string | null
          gender?: string | null
          occasion?: string | null
          category_id?: string | null
          cultural_origin_id?: string | null
          status?: "active" | "sold" | "inactive" | "pending_approval"
          featured?: boolean
          on_sale?: boolean
          free_shipping?: boolean
          tags?: string[] | null
        }
        Update: {
          title?: string
          description?: string
          price?: number
          original_price?: number | null
          condition?: "brand_new" | "like_new" | "gently_used" | "well_loved" | "vintage" | "custom_made" | "designer"
          size?: string | null
          color?: string | null
          gender?: string | null
          occasion?: string | null
          category_id?: string | null
          cultural_origin_id?: string | null
          status?: "active" | "sold" | "inactive" | "pending_approval"
          featured?: boolean
          on_sale?: boolean
          free_shipping?: boolean
          tags?: string[] | null
        }
      }
      item_images: {
        Row: {
          id: string
          item_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          item_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
        }
        Update: {
          image_url?: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
        }
        Update: never
      }
      likes: {
        Row: {
          id: string
          user_id: string
          item_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          item_id: string
        }
        Update: never
      }
      saves: {
        Row: {
          id: string
          user_id: string
          item_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          item_id: string
        }
        Update: never
      }
      conversations: {
        Row: {
          id: string
          item_id: string | null
          buyer_id: string
          seller_id: string
          last_message_at: string
          buyer_unread_count: number
          seller_unread_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          item_id?: string | null
          buyer_id: string
          seller_id: string
        }
        Update: {
          last_message_at?: string
          buyer_unread_count?: number
          seller_unread_count?: number
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          message_type: "text" | "image" | "item_inquiry" | "offer"
          content: string | null
          image_url: string | null
          offer_amount: number | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          conversation_id: string
          sender_id: string
          message_type?: "text" | "image" | "item_inquiry" | "offer"
          content?: string | null
          image_url?: string | null
          offer_amount?: number | null
        }
        Update: {
          read_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          seller_id: string
          item_id: string
          item_price: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded"
          tracking_number: string | null
          estimated_delivery: string | null
          shipping_address: Json
          billing_address: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          buyer_id: string
          seller_id: string
          item_id: string
          item_price: number
          shipping_cost?: number
          tax_amount?: number
          total_amount: number
          shipping_address: Json
          billing_address?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
        }
        Update: {
          status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded"
          tracking_number?: string | null
          estimated_delivery?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          reviewee_id: string
          item_id: string
          rating: number
          title: string | null
          comment: string | null
          reviewer_type: string
          is_public: boolean
          is_flagged: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          order_id: string
          reviewer_id: string
          reviewee_id: string
          item_id: string
          rating: number
          title?: string | null
          comment?: string | null
          reviewer_type: string
        }
        Update: {
          rating?: number
          title?: string | null
          comment?: string | null
          is_public?: boolean
          is_flagged?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "message" | "like" | "follow" | "sale" | "order_update" | "review"
          title: string
          message: string
          related_user_id: string | null
          related_item_id: string | null
          related_order_id: string | null
          related_conversation_id: string | null
          read_at: string | null
          clicked_at: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          type: "message" | "like" | "follow" | "sale" | "order_update" | "review"
          title: string
          message: string
          related_user_id?: string | null
          related_item_id?: string | null
          related_order_id?: string | null
          related_conversation_id?: string | null
        }
        Update: {
          read_at?: string | null
          clicked_at?: string | null
        }
      }
    }
    Views: {
      item_details: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          seller_username: string
          seller_first_name: string | null
          seller_avatar: string | null
          seller_rating: number
          seller_verified: "pending" | "verified" | "rejected"
          category_name: string | null
          cultural_origin_name: string | null
          image_urls: string[] | null
          likes_count: number
          views_count: number
          created_at: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          first_name: string | null
          last_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          cultural_backgrounds: string[] | null
          languages: string[] | null
          active_listings: number
          sold_items: number
          followers_count: number
          following_count: number
          rating: number
          rating_count: number
          created_at: string
        }
      }
    }
    Functions: {
      search_items: {
        Args: {
          search_query?: string
          category_filter?: string
          cultural_origin_filter?: string
          min_price?: number
          max_price?: number
          condition_filter?: string
          gender_filter?: string
          size_filter?: string
          color_filter?: string
          on_sale_filter?: boolean
          free_shipping_filter?: boolean
          sort_by?: string
          sort_order?: string
          page_limit?: number
          page_offset?: number
        }
        Returns: {
          id: string
          title: string
          price: number
          original_price: number | null
          seller_username: string
          cultural_origin_name: string | null
          condition: string
          image_url: string | null
          likes_count: number
          created_at: string
        }[]
      }
      get_user_analytics: {
        Args: {
          user_uuid: string
          days_back?: number
        }
        Returns: Json
      }
    }
  }
}
