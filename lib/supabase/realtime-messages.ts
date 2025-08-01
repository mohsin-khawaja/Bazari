import { createClient } from "./client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface RealtimeMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: "text" | "image" | "offer" | "inquiry"
  image_url?: string
  metadata?: any
  created_at: string
  sender: {
    id: string
    username: string
    avatar_url?: string
  }
}

export interface TypingUser {
  user_id: string
  username: string
  conversation_id: string
}

export class RealtimeMessaging {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()

  subscribeToConversation(
    conversationId: string,
    callbacks: {
      onMessage?: (message: RealtimeMessage) => void
      onTyping?: (user: TypingUser) => void
      onStopTyping?: (userId: string) => void
      onPresence?: (users: any[]) => void
    },
  ) {
    const channel = this.supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch complete message with sender info
          const { data: message } = await this.supabase
            .from("messages")
            .select(`
              *,
              sender:users!messages_sender_id_fkey(id, username, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single()

          if (message && callbacks.onMessage) {
            callbacks.onMessage(message as RealtimeMessage)
          }
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (callbacks.onTyping) {
          callbacks.onTyping(payload as TypingUser)
        }
      })
      .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
        if (callbacks.onStopTyping) {
          callbacks.onStopTyping(payload.user_id)
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        if (callbacks.onPresence) {
          callbacks.onPresence(users)
        }
      })
      .subscribe()

    this.channels.set(conversationId, channel)
    return channel
  }

  async sendTypingIndicator(conversationId: string, user: { id: string; username: string }) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: user.id,
          username: user.username,
          conversation_id: conversationId,
        },
      })
    }
  }

  async stopTypingIndicator(conversationId: string, userId: string) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "stop_typing",
        payload: { user_id: userId },
      })
    }
  }

  async trackPresence(conversationId: string, user: { id: string; username: string; avatar_url?: string }) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      await channel.track({
        user_id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        online_at: new Date().toISOString(),
      })
    }
  }

  unsubscribeFromConversation(conversationId: string) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(conversationId)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeMessaging = new RealtimeMessaging()
