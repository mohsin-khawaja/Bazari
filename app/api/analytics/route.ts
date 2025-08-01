import { createRouteHandlerServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerServerClient()
  const { searchParams } = new URL(request.url)

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const daysBack = Number.parseInt(searchParams.get("days_back") || "30")

    const { data, error } = await supabase.rpc("get_user_analytics", {
      user_uuid: user.id,
      days_back: daysBack,
    })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const body = await request.json()
    const { event_type, event_data, item_id } = body

    const { error } = await supabase.from("analytics_events").insert({
      user_id: user?.id || null,
      event_type,
      event_data: event_data || null,
      item_id: item_id || null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking event:", error)
    return NextResponse.json({ error: "Failed to track event", success: false }, { status: 500 })
  }
}
