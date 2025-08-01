"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { createCheckoutSession } from "@/lib/stripe/checkout"
import { toast } from "sonner"
import { ShoppingCart, Loader2 } from "lucide-react"

interface CheckoutButtonProps {
  item: {
    id: string
    title: string
    price: number
    seller_id: string
    item_images?: { image_url: string; is_primary: boolean }[]
  }
  quantity?: number
  className?: string
}

export function CheckoutButton({ item, quantity = 1, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to make a purchase")
      return
    }

    if (user.id === item.seller_id) {
      toast.error("You can't buy your own item")
      return
    }

    setLoading(true)

    try {
      const primaryImage = item.item_images?.find((img) => img.is_primary)

      const { sessionId } = await createCheckoutSession(
        [
          {
            itemId: item.id,
            quantity,
            price: item.price,
            title: item.title,
            imageUrl: primaryImage?.image_url,
          },
        ],
        user.id,
        item.seller_id,
      )

      // Redirect to Stripe Checkout
      const stripe = await import("@stripe/stripe-js").then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
      )

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to start checkout process")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
      {loading ? "Processing..." : `Buy Now - $${item.price}`}
    </Button>
  )
}
