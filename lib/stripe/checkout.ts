import { stripe } from "./config"
import { createClient } from "../supabase/server"

export interface CheckoutItem {
  itemId: string
  quantity: number
  price: number
  title: string
  imageUrl?: string
}

export async function createCheckoutSession(
  items: CheckoutItem[],
  buyerId: string,
  sellerId: string,
  shippingAddress?: any,
) {
  const supabase = createClient()

  // Create order in database first
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      status: "pending_payment",
      total_amount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shipping_address: shippingAddress,
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    item_id: item.itemId,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) throw itemsError

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/cancelled`,
    metadata: {
      orderId: order.id,
      buyerId,
      sellerId,
    },
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU"],
    },
  })

  // Update order with Stripe session ID
  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id)

  return { sessionId: session.id, orderId: order.id }
}

export async function retrieveCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId)
}
