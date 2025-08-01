"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Settings, Heart, MessageCircle, UserPlus, Package, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications,
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

export default function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isOpen, setIsOpen] = useState(false)

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
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await getNotifications(user.id, 50)
      setNotifications(data as Notification[])
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!user) return

    try {
      const count = await getUnreadNotificationCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading unread count:", error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await markAllNotificationsAsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))

      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find((n) => n.id === notificationId)
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "message":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "order_update":
        return <Package className="h-4 w-4 text-purple-500" />
      case "price_drop":
        return <TrendingDown className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50"
      case "high":
        return "border-l-orange-500 bg-orange-50"
      case "normal":
        return "border-l-blue-500 bg-blue-50"
      case "low":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeTab) {
      case "unread":
        return !notification.read_at
      case "messages":
        return notification.type === "message"
      case "activity":
        return ["like", "follow", "order_update"].includes(notification.type)
      case "alerts":
        return notification.type === "price_drop"
      default:
        return true
    }
  })

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const isUnread = !notification.read_at
    const relatedUser = notification.related_user
    const relatedItem = notification.related_item
    const primaryImage = relatedItem?.item_images?.find((img) => img.is_primary)?.image_url

    return (
      <div
        className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
          isUnread ? "bg-opacity-100" : "bg-opacity-50"
        } hover:bg-opacity-75 transition-colors`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {relatedUser?.avatar_url ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={relatedUser.avatar_url || "/placeholder.svg"} alt={relatedUser.username} />
                <AvatarFallback>
                  {(relatedUser.first_name || relatedUser.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                  {notification.message}
                </p>

                {relatedItem && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-background rounded-md">
                    {primaryImage && (
                      <img
                        src={primaryImage || "/placeholder.svg"}
                        alt={relatedItem.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{relatedItem.title}</p>
                      <p className="text-xs text-muted-foreground">${relatedItem.price}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              {notification.action_url && (
                <Link href={notification.action_url}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs bg-transparent"
                    onClick={() => {
                      if (isUnread) {
                        handleMarkAsRead(notification.id)
                      }
                      setIsOpen(false)
                    }}
                  >
                    View
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                  Mark all read
                </Button>
              )}
              <Link href="/settings/notifications">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                Activity
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs">
                Alerts
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm mt-1">We'll notify you when something happens!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification, index) => (
                      <div key={notification.id}>
                        <NotificationItem notification={notification} />
                        {index < filteredNotifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
