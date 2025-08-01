import { createClient } from "./client"

export async function getOrdersByUser(userId: string, type: "buyer" | "seller" = "buyer") {
  const supabase = createClient()

  const column = type === "buyer" ? "buyer_id" : "seller_id"

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!buyer_id(*),
      seller:profiles!seller_id(*),
      order_items(
        *,
        item:items(
          *,
          item_images(image_url, is_primary)
        )
      )
    `)
    .eq(column, userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderById(orderId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!buyer_id(*),
      seller:profiles!seller_id(*),
      order_items(
        *,
        item:items(
          *,
          item_images(image_url, is_primary)
        )
      )
    `)
    .eq("id", orderId)
    .single()

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const supabase = createClient()

  const updateData: any = { status }
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber
    updateData.shipped_at = new Date().toISOString()
  }

  const { error } = await supabase.from("orders").update(updateData).eq("id", orderId)

  if (error) throw error
}

export async function createRefundRequest(orderId: string, reason: string, amount?: number) {
  const supabase = createClient()

  const { data: order } = await supabase.from("orders").select("total_amount").eq("id", orderId).single()

  const { data, error } = await supabase
    .from("refunds")
    .insert({
      order_id: orderId,
      reason,
      amount: amount || order?.total_amount,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function processRefund(refundId: string, approve: boolean, adminNotes?: string) {
  const supabase = createClient()

  const { data: refund, error: refundError } = await supabase
    .from("refunds")
    .select(`
      *,
      order:orders(stripe_payment_intent_id)
    `)
    .eq("id", refundId)
    .single()

  if (refundError) throw refundError

  if (approve && refund.order.stripe_payment_intent_id) {
    // Process refund through Stripe
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

    try {
      await stripe.refunds.create({
        payment_intent: refund.order.stripe_payment_intent_id,
        amount: Math.round(refund.amount * 100), // Convert to cents
      })

      // Update refund status
      await supabase
        .from("refunds")
        .update({
          status: "approved",
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq("id", refundId)
    } catch (stripeError) {
      console.error("Stripe refund error:", stripeError)
      throw new Error("Failed to process refund")
    }
  } else {
    // Reject refund
    await supabase
      .from("refunds")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq("id", refundId)
  }
}
