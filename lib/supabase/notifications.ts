import { createClient } from "./client"
import type { Database } from "./types"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]
type NotificationPreferences = Database["public"]["Tables"]["notification_preferences"]["Row"]
type PriceAlert = Database["public"]["Tables"]["price_alerts"]["Row"]

export async function getNotifications(userId: string, limit = 20, offset = 0) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      related_user:users!related_user_id (
        id,
        username,
        first_name,
        avatar_url
      ),
      related_item:items!related_item_id (
        id,
        title,
        price,
        item_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = createClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)

  if (error) throw error
  return count || 0
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)

  if (error) throw error
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null)

  if (error) throw error
}

export async function deleteNotification(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

  if (error) throw error
}

export async function getNotificationPreferences(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createPriceAlert(userId: string, itemId: string, targetPrice: number, originalPrice: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("price_alerts")
    .upsert({
      user_id: userId,
      item_id: itemId,
      target_price: targetPrice,
      original_price: originalPrice,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPriceAlerts(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("price_alerts")
    .select(`
      *,
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
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function deletePriceAlert(alertId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("price_alerts").delete().eq("id", alertId)

  if (error) throw error
}

export async function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  const supabase = createClient()

  return supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      },
    )
    .subscribe()
}

// Notification creation helpers
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  options?: {
    relatedUserId?: string
    relatedItemId?: string
    relatedOrderId?: string
    relatedConversationId?: string
    priority?: "low" | "normal" | "high" | "urgent"
    actionUrl?: string
    imageUrl?: string
    expiresAt?: string
  },
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
      related_user_id: options?.relatedUserId,
      related_item_id: options?.relatedItemId,
      related_order_id: options?.relatedOrderId,
      related_conversation_id: options?.relatedConversationId,
      priority: options?.priority || "normal",
      action_url: options?.actionUrl,
      image_url: options?.imageUrl,
      expires_at: options?.expiresAt,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createLikeNotification(itemId: string, likerId: string) {
  const supabase = createClient()

  // Get item and seller info
  const { data: item } = await supabase
    .from("items")
    .select("title, seller_id, users!seller_id(username, first_name)")
    .eq("id", itemId)
    .single()

  if (!item || item.seller_id === likerId) return // Don't notify if user likes their own item

  const { data: liker } = await supabase.from("users").select("username, first_name").eq("id", likerId).single()

  if (!liker) return

  const likerName = liker.first_name || liker.username

  await createNotification(
    item.seller_id,
    "like",
    "Someone liked your item!",
    `${likerName} liked your item "${item.title}"`,
    {
      relatedUserId: likerId,
      relatedItemId: itemId,
      actionUrl: `/items/${itemId}`,
      priority: "low",
    },
  )
}

export async function createFollowNotification(followerId: string, followingId: string) {
  const supabase = createClient()

  const { data: follower } = await supabase
    .from("users")
    .select("username, first_name, avatar_url")
    .eq("id", followerId)
    .single()

  if (!follower) return

  const followerName = follower.first_name || follower.username

  await createNotification(followingId, "follow", "New follower!", `${followerName} started following you`, {
    relatedUserId: followerId,
    actionUrl: `/profile/${follower.username}`,
    imageUrl: follower.avatar_url,
    priority: "normal",
  })
}

export async function createMessageNotification(
  conversationId: string,
  senderId: string,
  recipientId: string,
  messagePreview: string,
) {
  const supabase = createClient()

  const { data: sender } = await supabase
    .from("users")
    .select("username, first_name, avatar_url")
    .eq("id", senderId)
    .single()

  if (!sender) return

  const senderName = sender.first_name || sender.username

  await createNotification(
    recipientId,
    "message",
    "New message",
    `${senderName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? "..." : ""}`,
    {
      relatedUserId: senderId,
      relatedConversationId: conversationId,
      actionUrl: `/messages/${conversationId}`,
      imageUrl: sender.avatar_url,
      priority: "high",
    },
  )
}

export async function createOrderNotification(orderId: string, userId: string, status: string) {
  const supabase = createClient()

  const statusMessages = {
    confirmed: "Your order has been confirmed!",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered!",
    cancelled: "Your order has been cancelled",
  }

  const priorities = {
    confirmed: "normal" as const,
    shipped: "high" as const,
    delivered: "high" as const,
    cancelled: "normal" as const,
  }

  await createNotification(
    userId,
    "order_update",
    "Order Update",
    statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`,
    {
      relatedOrderId: orderId,
      actionUrl: `/orders/${orderId}`,
      priority: priorities[status as keyof typeof priorities] || "normal",
    },
  )
}
