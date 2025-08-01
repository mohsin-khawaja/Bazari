import { createClient } from "./client"

export interface MessageData {
  conversation_id: string
  content: string
  message_type: "text" | "image" | "offer" | "inquiry"
  image_url?: string
  metadata?: any
}

export interface BlockUserData {
  blocked_user_id: string
  reason?: string
}

export interface ReportData {
  reported_user_id: string
  message_id?: string
  reason: string
  description?: string
}

export async function sendMessage(messageData: MessageData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if user is blocked
  const { data: blocked } = await supabase
    .from("blocked_users")
    .select("id")
    .eq("blocker_id", messageData.conversation_id)
    .eq("blocked_id", user.id)
    .single()

  if (blocked) {
    throw new Error("You are blocked from sending messages to this user")
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      ...messageData,
      sender_id: user.id,
    })
    .select(`
      *,
      sender:users!messages_sender_id_fkey(id, username, avatar_url)
    `)
    .single()

  if (error) throw error

  // Update conversation last_message_at
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageData.conversation_id)

  // Mark message as unread for other participants
  await supabase.rpc("mark_conversation_unread", {
    p_conversation_id: messageData.conversation_id,
    p_sender_id: user.id,
  })

  return data
}

export async function markMessageAsRead(messageId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("message_reads").upsert({
    message_id: messageId,
    user_id: user.id,
    read_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function markConversationAsRead(conversationId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
    p_user_id: user.id,
  })

  if (error) throw error
}

export async function deleteMessage(messageId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("messages")
    .update({
      content: "This message was deleted",
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("sender_id", user.id)

  if (error) throw error
}

export async function blockUser(data: BlockUserData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("blocked_users").insert({
    blocker_id: user.id,
    blocked_id: data.blocked_user_id,
    reason: data.reason,
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function unblockUser(blockedUserId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedUserId)

  if (error) throw error
}

export async function reportUser(data: ReportData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("user_reports").insert({
    reporter_id: user.id,
    reported_user_id: data.reported_user_id,
    message_id: data.message_id,
    reason: data.reason,
    description: data.description,
    status: "pending",
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function getBlockedUsers() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("blocked_users")
    .select(`
      *,
      blocked_user:users!blocked_users_blocked_id_fkey(id, username, avatar_url)
    `)
    .eq("blocker_id", user.id)

  if (error) throw error
  return data
}

export async function addMessageReaction(messageId: string, emoji: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("message_reactions").upsert({
    message_id: messageId,
    user_id: user.id,
    emoji,
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function removeMessageReaction(messageId: string, emoji: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)

  if (error) throw error
}
