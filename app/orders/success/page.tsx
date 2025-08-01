"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, MessageCircle } from "lucide-react"
import Link from "next/link"
import { retrieveCheckoutSession } from "@/lib/stripe/checkout"
import { getOrderById } from "@/lib/supabase/orders"

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      loadOrderDetails()
    }
  }, [sessionId])

  const loadOrderDetails = async () => {
    try {
      const session = await retrieveCheckoutSession(sessionId!)
      const orderId = session.metadata?.orderId

      if (orderId) {
        const orderData = await getOrderById(orderId)
        setOrder(orderData)
      }
    } catch (error) {
      console.error("Error loading order details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-700">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2">Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        {order && (
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">#{order.id.slice(0, 8)}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">${order.total_amount}</span>
              </div>

              <div className="flex justify-between">
                <span>Seller:</span>
                <span>{order.seller.full_name}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Items:</h4>
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.item.title}</span>
                    <span>
                      {item.quantity} × ${item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  The seller has been notified and will process your order shortly. You'll receive tracking information
                  once your item ships.
                </p>

                <div className="flex gap-2 pt-4">
                  <Button asChild>
                    <Link href="/orders">
                      <Package className="w-4 h-4 mr-2" />
                      View All Orders
                    </Link>
                  </Button>

                  <Button variant="outline" asChild>
                    <Link href={`/messages?user=${order.seller.id}`}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Seller
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
