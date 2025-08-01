import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmailNotification } from "@/lib/email/notifications"

// This endpoint processes the notification queue
// It should be called by a cron job or background worker
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get pending notifications from queue
    const { data: queueItems, error: queueError } = await supabase
      .from("notification_queue")
      .select(`
        *,
        user:users (
          id,
          username,
          first_name,
          last_name,
          email
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(100)

    if (queueError) {
      console.error("Error fetching queue items:", queueError)
      return NextResponse.json({ error: "Failed to fetch queue items" }, { status: 500 })
    }

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const item of queueItems) {
      try {
        if (item.channel === "email" && item.user?.email) {
          await sendEmailNotification({
            recipientEmail: item.user.email,
            recipientName: item.user.first_name || item.user.username,
            subject: item.subject || item.message,
            type: item.notification_type,
            data: item.data,
          })
        } else if (item.channel === "push") {
          // TODO: Implement push notification sending
          // This would integrate with a service like Firebase Cloud Messaging
          console.log("Push notification would be sent:", item)
        }

        // Mark as sent
        await supabase
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", item.id)

        results.processed++
      } catch (error) {
        console.error(`Error processing notification ${item.id}:`, error)

        // Update retry count and status
        const newRetryCount = (item.retry_count || 0) + 1
        const maxRetries = 3

        await supabase
          .from("notification_queue")
          .update({
            status: newRetryCount >= maxRetries ? "failed" : "pending",
            retry_count: newRetryCount,
            error_message: error instanceof Error ? error.message : "Unknown error",
            scheduled_for:
              newRetryCount < maxRetries
                ? new Date(Date.now() + Math.pow(2, newRetryCount) * 60000).toISOString() // Exponential backoff
                : undefined,
          })
          .eq("id", item.id)

        results.failed++
        results.errors.push(`Item ${item.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error processing notification queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
