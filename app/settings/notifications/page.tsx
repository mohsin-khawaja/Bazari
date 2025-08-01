"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Smartphone, Monitor, Save, Trash2, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getPriceAlerts,
  deletePriceAlert,
  requestNotificationPermission,
  registerPushToken,
} from "@/lib/supabase/notifications"

interface NotificationPreferences {
  email_messages: boolean
  email_likes: boolean
  email_follows: boolean
  email_orders: boolean
  email_price_drops: boolean
  email_marketing: boolean
  push_messages: boolean
  push_likes: boolean
  push_follows: boolean
  push_orders: boolean
  push_price_drops: boolean
  in_app_messages: boolean
  in_app_likes: boolean
  in_app_follows: boolean
  in_app_orders: boolean
  in_app_price_drops: boolean
}

interface PriceAlert {
  id: string
  target_price: number
  original_price: number
  created_at: string
  item: {
    id: string
    title: string
    price: number
    status: string
    item_images: Array<{
      image_url: string
      is_primary: boolean
    }>
  }
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (user) {
      loadPreferences()
      loadPriceAlerts()
    }

    // Check push notification support
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true)
      setPushPermission(Notification.permission)
    }
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      const data = await getNotificationPreferences(user.id)
      setPreferences(
        data || {
          email_messages: true,
          email_likes: true,
          email_follows: true,
          email_orders: true,
          email_price_drops: true,
          email_marketing: false,
          push_messages: true,
          push_likes: true,
          push_follows: true,
          push_orders: true,
          push_price_drops: true,
          in_app_messages: true,
          in_app_likes: true,
          in_app_follows: true,
          in_app_orders: true,
          in_app_price_drops: true,
        },
      )
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPriceAlerts = async () => {
    if (!user) return

    try {
      const data = await getPriceAlerts(user.id)
      setPriceAlerts(data as PriceAlert[])
    } catch (error) {
      console.error("Error loading price alerts:", error)
    }
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return
    setPreferences({ ...preferences, [key]: value })
  }

  const handleSavePreferences = async () => {
    if (!user || !preferences) return

    setSaving(true)
    try {
      await updateNotificationPreferences(user.id, preferences)
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEnablePushNotifications = async () => {
    try {
      const token = await requestNotificationPermission()
      if (token && user) {
        await registerPushToken(user.id, token, "web")
        setPushPermission("granted")
        toast({
          title: "Push notifications enabled",
          description: "You'll now receive push notifications for important updates",
        })
      }
    } catch (error) {
      console.error("Error enabling push notifications:", error)
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      })
    }
  }

  const handleDeletePriceAlert = async (alertId: string) => {
    try {
      await deletePriceAlert(alertId)
      setPriceAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
      toast({
        title: "Price alert removed",
        description: "You'll no longer receive notifications for this item",
      })
    } catch (error) {
      console.error("Error deleting price alert:", error)
      toast({
        title: "Error",
        description: "Failed to remove price alert",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how and when you receive notifications from Bazari</p>
        </div>

        <div className="space-y-6">
          {/* Push Notifications Setup */}
          {pushSupported && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Browser Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get instant notifications even when Bazari isn't open
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pushPermission === "granted" ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Enabled
                      </Badge>
                    ) : pushPermission === "denied" ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Button onClick={handleEnablePushNotifications} size="sm">
                        Enable
                      </Button>
                    )}
                  </div>
                </div>
                {pushPermission === "denied" && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Push notifications are blocked. To enable them, click the lock icon in your browser's address bar
                      and allow notifications.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_messages">Messages</Label>
                  <p className="text-sm text-muted-foreground">New messages from buyers and sellers</p>
                </div>
                <Switch
                  id="email_messages"
                  checked={preferences.email_messages}
                  onCheckedChange={(checked) => handlePreferenceChange("email_messages", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_likes">Likes</Label>
                  <p className="text-sm text-muted-foreground">When someone likes your items</p>
                </div>
                <Switch
                  id="email_likes"
                  checked={preferences.email_likes}
                  onCheckedChange={(checked) => handlePreferenceChange("email_likes", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_follows">Follows</Label>
                  <p className="text-sm text-muted-foreground">When someone follows you</p>
                </div>
                <Switch
                  id="email_follows"
                  checked={preferences.email_follows}
                  onCheckedChange={(checked) => handlePreferenceChange("email_follows", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_orders">Orders</Label>
                  <p className="text-sm text-muted-foreground">Order confirmations and status updates</p>
                </div>
                <Switch
                  id="email_orders"
                  checked={preferences.email_orders}
                  onCheckedChange={(checked) => handlePreferenceChange("email_orders", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_price_drops">Price Drops</Label>
                  <p className="text-sm text-muted-foreground">When items you're watching drop in price</p>
                </div>
                <Switch
                  id="email_price_drops"
                  checked={preferences.email_price_drops}
                  onCheckedChange={(checked) => handlePreferenceChange("email_price_drops", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_marketing">Marketing</Label>
                  <p className="text-sm text-muted-foreground">Promotions, tips, and feature updates</p>
                </div>
                <Switch
                  id="email_marketing"
                  checked={preferences.email_marketing}
                  onCheckedChange={(checked) => handlePreferenceChange("email_marketing", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_messages">Messages</Label>
                  <p className="text-sm text-muted-foreground">Instant notifications for new messages</p>
                </div>
                <Switch
                  id="push_messages"
                  checked={preferences.push_messages}
                  onCheckedChange={(checked) => handlePreferenceChange("push_messages", checked)}
                  disabled={pushPermission !== "granted"}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_orders">Orders</Label>
                  <p className="text-sm text-muted-foreground">Order status updates</p>
                </div>
                <Switch
                  id="push_orders"
                  checked={preferences.push_orders}
                  onCheckedChange={(checked) => handlePreferenceChange("push_orders", checked)}
                  disabled={pushPermission !== "granted"}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_price_drops">Price Drops</Label>
                  <p className="text-sm text-muted-foreground">Instant alerts for price drops</p>
                </div>
                <Switch
                  id="push_price_drops"
                  checked={preferences.push_price_drops}
                  onCheckedChange={(checked) => handlePreferenceChange("push_price_drops", checked)}
                  disabled={pushPermission !== "granted"}
                />
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                In-App Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="in_app_messages">Messages</Label>
                  <p className="text-sm text-muted-foreground">Show message notifications in the app</p>
                </div>
                <Switch
                  id="in_app_messages"
                  checked={preferences.in_app_messages}
                  onCheckedChange={(checked) => handlePreferenceChange("in_app_messages", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="in_app_likes">Activity</Label>
                  <p className="text-sm text-muted-foreground">Likes, follows, and other activity</p>
                </div>
                <Switch
                  id="in_app_likes"
                  checked={preferences.in_app_likes}
                  onCheckedChange={(checked) => handlePreferenceChange("in_app_likes", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="in_app_orders">Orders</Label>
                  <p className="text-sm text-muted-foreground">Order updates and confirmations</p>
                </div>
                <Switch
                  id="in_app_orders"
                  checked={preferences.in_app_orders}
                  onCheckedChange={(checked) => handlePreferenceChange("in_app_orders", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Price Alerts */}
          {priceAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Active Price Alerts
                  <Badge variant="secondary">{priceAlerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceAlerts.map((alert) => {
                    const primaryImage = alert.item.item_images?.find((img) => img.is_primary)?.image_url
                    const savings = alert.item.price <= alert.target_price ? alert.target_price - alert.item.price : 0

                    return (
                      <div key={alert.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        {primaryImage && (
                          <img
                            src={primaryImage || "/placeholder.svg"}
                            alt={alert.item.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{alert.item.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Current: ${alert.item.price.toFixed(2)}</span>
                            <span>Target: ${alert.target_price.toFixed(2)}</span>
                            {savings > 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Triggered!
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePriceAlert(alert.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} disabled={saving} className="min-w-32">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
