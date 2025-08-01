"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"

interface Conversation {
  id: string
  item_id?: string
  created_at: string
  updated_at: string
  last_message_at?: string
  unread_count: number
  other_user: {
    id: string
    username: string
    avatar_url?: string
  }
  item?: {
    id: string
    title: string
    images: string[]
    price: number
  }
  last_message?: {
    content: string
    message_type: string
    created_at: string
    sender_id: string
  }
}

export function useRealtimeConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const loadConversations = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Get conversations with unread counts
      const { data, error } = await supabase.rpc("get_user_conversations", { p_user_id: user.id })

      if (error) throw error

      setConversations(data || [])
    } catch (err) {
      console.error("Error loading conversations:", err)
      setError("Failed to load conversations")
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Subscribe to conversation updates
  useEffect(() => {
    if (!user) return

    loadConversations()

    // Subscribe to new messages in user's conversations
    const messagesChannel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Check if this message is in one of user's conversations
          const { data: conversation } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("conversation_id", payload.new.conversation_id)
            .eq("user_id", user.id)
            .single()

          if (conversation) {
            // Reload conversations to get updated data
            loadConversations()
          }
        },
      )
      .subscribe()

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel("user-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }, [user, loadConversations, supabase])

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0)
  }, [conversations])

  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      if (!user) return

      try {
        await supabase.rpc("mark_conversation_read", {
          p_conversation_id: conversationId,
          p_user_id: user.id,
        })

        // Update local state
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)),
        )
      } catch (err) {
        console.error("Error marking conversation as read:", err)
      }
    },
    [user, supabase],
  )

  const createConversation = useCallback(
    async (otherUserId: string, itemId?: string) => {
      if (!user) throw new Error("Not authenticated")

      try {
        const { data, error } = await supabase.rpc("create_conversation", {
          p_user1_id: user.id,
          p_user2_id: otherUserId,
          p_item_id: itemId,
        })

        if (error) throw error

        // Reload conversations
        loadConversations()

        return data
      } catch (err) {
        console.error("Error creating conversation:", err)
        throw err
      }
    },
    [user, supabase, loadConversations],
  )

  return {
    conversations,
    isLoading,
    error,
    totalUnreadCount: getTotalUnreadCount(),
    loadConversations,
    markConversationAsRead,
    createConversation,
  }
}
