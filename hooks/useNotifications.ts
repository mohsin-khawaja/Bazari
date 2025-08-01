"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth"
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  createLikeNotification,
  createFollowNotification,
  createMessageNotification,
  createOrderNotification,
} from "@/lib/supabase/notifications"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read_at: string | null
  created_at: string
  priority: "low" | "normal" | "high" | "urgent"
  action_url?: string
  image_url?: string
  related_user?: {
    id: string
    username: string
    first_name: string | null
    avatar_url: string | null
  }
  related_item?: {
    id: string
    title: string
    price: number
    item_images: Array<{
      image_url: string
      is_primary: boolean
    }>
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadNotifications = useCallback(
    async (limit = 20, offset = 0) => {
      if (!user) return

      setLoading(true)
      try {
        const data = await getNotifications(user.id, limit, offset)
        setNotifications(data as Notification[])
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const loadUnreadCount = useCallback(async () => {
    if (!user) return

    try {
      const count = await getUnreadNotificationCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading unread count:", error)
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      await markAllNotificationsAsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }, [user])

  // Notification creation helpers
  const createLikeNotif = useCallback(async (itemId: string, likerId: string) => {
    try {
      await createLikeNotification(itemId, likerId)
    } catch (error) {
      console.error("Error creating like notification:", error)
    }
  }, [])

  const createFollowNotif = useCallback(async (followerId: string, followingId: string) => {
    try {
      await createFollowNotification(followerId, followingId)
    } catch (error) {
      console.error("Error creating follow notification:", error)
    }
  }, [])

  const createMessageNotif = useCallback(
    async (conversationId: string, senderId: string, recipientId: string, messagePreview: string) => {
      try {
        await createMessageNotification(conversationId, senderId, recipientId, messagePreview)
      } catch (error) {
        console.error("Error creating message notification:", error)
      }
    },
    [],
  )

  const createOrderNotif = useCallback(async (orderId: string, userId: string, status: string) => {
    try {
      await createOrderNotification(orderId, userId, status)
    } catch (error) {
      console.error("Error creating order notification:", error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadNotifications()
      loadUnreadCount()

      // Subscribe to real-time notifications
      const subscription = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications((prev) => [newNotification as Notification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/icon-192x192.png",
            badge: "/badge-72x72.png",
          })
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, loadNotifications, loadUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    createLikeNotif,
    createFollowNotif,
    createMessageNotif,
    createOrderNotif,
  }
}
