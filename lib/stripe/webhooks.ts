import { stripe } from "./config"
import { createClient } from "../supabase/server"
import { sendOrderConfirmationEmail } from "../email/orders"
import type Stripe from "stripe"

export async function handleStripeWebhook(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set")
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    throw new Error("Invalid signature")
  }

  const supabase = createClient()

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.orderId) {
        // Update order status to paid
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq("id", session.metadata.orderId)

        if (orderError) {
          console.error("Error updating order:", orderError)
          throw orderError
        }

        // Get order details for email
        const { data: order } = await supabase
          .from("orders")
          .select(`
            *,
            buyer:profiles!buyer_id(*),
            seller:profiles!seller_id(*),
            order_items(
              *,
              item:items(*)
            )
          `)
          .eq("id", session.metadata.orderId)
          .single()

        if (order) {
          // Send confirmation emails
          await sendOrderConfirmationEmail(order, "buyer")
          await sendOrderConfirmationEmail(order, "seller")
        }

        // Update item availability if needed
        for (const orderItem of order?.order_items || []) {
          if (orderItem.item.quantity !== null) {
            await supabase
              .from("items")
              .update({
                quantity: Math.max(0, orderItem.item.quantity - orderItem.quantity),
              })
              .eq("id", orderItem.item_id)
          }
        }
      }
      break

    case "payment_intent.payment_failed":
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      if (paymentIntent.metadata?.orderId) {
        await supabase.from("orders").update({ status: "payment_failed" }).eq("id", paymentIntent.metadata.orderId)
      }
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}
