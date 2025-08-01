import { createClient } from "./client"

export async function registerPushToken(userId: string, token: string, deviceType: "web" | "ios" | "android") {
  const supabase = createClient()

  const { error } = await supabase.from("push_notification_tokens").upsert({
    user_id: userId,
    token,
    device_type: deviceType,
    is_active: true,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function unregisterPushToken(userId: string, token: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("push_notification_tokens")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("token", token)

  if (error) throw error
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return null
  }

  if (Notification.permission === "denied") {
    console.log("Notifications are denied")
    return null
  }

  if (Notification.permission === "granted") {
    // Permission already granted, register service worker
    return await registerServiceWorker()
  } else if (Notification.permission !== "denied") {
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      return await registerServiceWorker()
    }
  }

  return null
}

async function registerServiceWorker(): Promise<string | null> {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js")

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready

    // Get push subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    return JSON.stringify(subscription)
  } catch (error) {
    console.error("Error registering service worker:", error)
    return null
  }
}

export async function sendTestNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
    })
  }
}
