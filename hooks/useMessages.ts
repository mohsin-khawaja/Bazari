"use client"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"

export function useMessages() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          buyer:users!buyer_id (
            id,
            username,
            first_name,
            avatar_url
          ),
          seller:users!seller_id (
            id,
            username,
            first_name,
            avatar_url
          ),
          item:items (
            id,
            title,
            price,
            status,
            item_images (
              image_url,
              is_primary
            )
          ),
          messages (
            content,
            created_at,
            sender_id
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (error) throw error

      // Get last message for each conversation
      const conversationsWithLastMessage =
        data?.map((conv) => {
          const lastMessage = conv.messages?.[conv.messages.length - 1]
          return {
            ...conv,
            last_message: lastMessage?.content || "",
            last_message_time: lastMessage?.created_at || conv.created_at,
          }
        }) || []

      setConversations(conversationsWithLastMessage)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch conversations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `buyer_id=eq.${user.id}`,
        },
        () => fetchConversations(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `seller_id=eq.${user.id}`,
        },
        () => fetchConversations(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations,
  }
}

export function useConversation(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchMessages = async () => {
    if (!conversationId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch conversation details
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select(`
          *,
          buyer:users!buyer_id (
            id,
            username,
            first_name,
            avatar_url
          ),
          seller:users!seller_id (
            id,
            username,
            first_name,
            avatar_url
          ),
          item:items (
            id,
            title,
            price,
            status,
            item_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq("id", conversationId)
        .single()

      if (convError) throw convError
      setConversation(convData)

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users (
            id,
            username,
            first_name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (messagesError) throw messagesError
      setMessages(messagesData || [])

      // Mark messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .is("read_at", null)

        // Update unread count
        const updateField = convData.buyer_id === user.id ? "buyer_unread_count" : "seller_unread_count"
        await supabase
          .from("conversations")
          .update({ [updateField]: 0 })
          .eq("id", conversationId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, messageType = "text", offerAmount?: number) => {
    if (!user || !conversationId) return

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_type: messageType,
          content: messageType === "text" ? content : null,
          offer_amount: offerAmount || null,
        })
        .select(`
          *,
          sender:users (
            id,
            username,
            first_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to send message")
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data } = await supabase
            .from("messages")
            .select(`
              *,
              sender:users (
                id,
                username,
                first_name,
                avatar_url
              )
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.find((msg) => msg.id === data.id)) return prev
              return [...prev, data]
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  return {
    messages,
    conversation,
    loading,
    error,
    sendMessage,
    refresh: fetchMessages,
  }
}
