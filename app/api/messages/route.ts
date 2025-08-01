import { createRouteHandlerServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("conversation_details")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { conversation_id, content, message_type = "text", offer_amount } = body

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        message_type,
        content,
        offer_amount,
      })
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

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message", success: false }, { status: 500 })
  }
}
