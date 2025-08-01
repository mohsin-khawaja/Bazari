import { createClient } from "./client"
import type { Database } from "./types"

type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]

export async function getConversations(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("conversation_details")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getConversation(conversationId: string) {
  const supabase = createClient()

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
        status
      )
    `)
    .eq("id", conversationId)
    .single()

  if (error) throw error
  return data
}

export async function getMessages(conversationId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
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

  if (error) throw error
  return data
}

export async function createConversation(buyerId: string, sellerId: string, itemId?: string) {
  const supabase = createClient()

  // Check if conversation already exists
  let query = supabase.from("conversations").select("*").eq("buyer_id", buyerId).eq("seller_id", sellerId)

  if (itemId) {
    query = query.eq("item_id", itemId)
  }

  const { data: existing } = await query.single()

  if (existing) {
    return existing
  }

  // Create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      item_id: itemId || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function sendMessage(message: MessageInsert) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .insert(message)
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
  return data
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const supabase = createClient()

  // Mark messages as read
  const { error: messagesError } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null)

  if (messagesError) throw messagesError

  // Reset unread count
  const { data: conversation } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .single()

  if (conversation) {
    const updateField = conversation.buyer_id === userId ? "buyer_unread_count" : "seller_unread_count"

    const { error: conversationError } = await supabase
      .from("conversations")
      .update({ [updateField]: 0 })
      .eq("id", conversationId)

    if (conversationError) throw conversationError
  }
}

export async function subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
  const supabase = createClient()

  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      },
    )
    .subscribe()
}
