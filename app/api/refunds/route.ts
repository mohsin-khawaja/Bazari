import { type NextRequest, NextResponse } from "next/server"
import { createRefundRequest, processRefund } from "@/lib/supabase/orders"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, reason, amount } = await request.json()

    if (!orderId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const refund = await createRefundRequest(orderId, reason, amount)

    return NextResponse.json(refund)
  } catch (error) {
    console.error("Error creating refund request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (you might want to implement proper admin roles)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { refundId, approve, adminNotes } = await request.json()

    if (!refundId || typeof approve !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await processRefund(refundId, approve, adminNotes)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing refund:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
