"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { realtimeMessaging, type RealtimeMessage } from "@/lib/supabase/realtime-messages"
import { markConversationAsRead } from "@/lib/supabase/message-actions"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"

interface TypingUser {
  user_id: string
  username: string
  conversation_id: string
}

export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username, avatar_url),
          reactions:message_reactions(emoji, user_id, users(username))
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error

      setMessages(data || [])

      // Mark conversation as read
      if (user) {
        await markConversationAsRead(conversationId)
      }
    } catch (err) {
      console.error("Error loading messages:", err)
      setError("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, user, supabase])

  // Handle new messages
  const handleNewMessage = useCallback(
    (message: RealtimeMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })

      // Mark as read if user is active
      if (user && message.sender_id !== user.id) {
        markConversationAsRead(conversationId)
      }
    },
    [conversationId, user],
  )

  // Handle typing indicators
  const handleTyping = useCallback(
    (typingUser: TypingUser) => {
      if (!user || typingUser.user_id === user.id) return

      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.user_id !== typingUser.user_id)
        return [...filtered, typingUser]
      })

      // Clear existing timeout for this user
      const existingTimeout = typingTimeoutsRef.current.get(typingUser.user_id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout to remove typing indicator
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.user_id !== typingUser.user_id))
        typingTimeoutsRef.current.delete(typingUser.user_id)
      }, 5000)

      typingTimeoutsRef.current.set(typingUser.user_id, timeout)
    },
    [user],
  )

  // Handle stop typing
  const handleStopTyping = useCallback((userId: string) => {
    setTypingUsers((prev) => prev.filter((u) => u.user_id !== userId))

    const timeout = typingTimeoutsRef.current.get(userId)
    if (timeout) {
      clearTimeout(timeout)
      typingTimeoutsRef.current.delete(userId)
    }
  }, [])

  // Handle presence updates
  const handlePresence = useCallback((users: any[]) => {
    setOnlineUsers(users)
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId || !user) return

    loadMessages()

    const channel = realtimeMessaging.subscribeToConversation(conversationId, {
      onMessage: handleNewMessage,
      onTyping: handleTyping,
      onStopTyping: handleStopTyping,
      onPresence: handlePresence,
    })

    // Track user presence
    realtimeMessaging.trackPresence(conversationId, {
      id: user.id,
      username: user.user_metadata?.username || user.email || "Anonymous",
      avatar_url: user.user_metadata?.avatar_url,
    })

    return () => {
      realtimeMessaging.unsubscribeFromConversation(conversationId)

      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      typingTimeoutsRef.current.clear()
    }
  }, [conversationId, user, loadMessages, handleNewMessage, handleTyping, handleStopTyping, handlePresence])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || messages.length === 0) return

    try {
      const oldestMessage = messages[0]
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username, avatar_url),
          reactions:message_reactions(emoji, user_id, users(username))
        `)
        .eq("conversation_id", conversationId)
        .lt("created_at", oldestMessage.created_at)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      if (data && data.length > 0) {
        setMessages((prev) => [...data.reverse(), ...prev])
      }
    } catch (err) {
      console.error("Error loading more messages:", err)
    }
  }, [conversationId, messages, supabase])

  return {
    messages,
    typingUsers,
    onlineUsers,
    isLoading,
    error,
    loadMoreMessages,
    refreshMessages: loadMessages,
  }
}
