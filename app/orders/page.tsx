"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderCard } from "@/components/OrderCard"
import { useAuth } from "@/hooks/useAuth"
import { updateOrderStatus, createRefundRequest } from "@/lib/supabase/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const [buyerOrders, setBuyerOrders] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      const [buyerResponse, sellerResponse] = await Promise.all([
        fetch("/api/orders?type=buyer"),
        fetch("/api/orders?type=seller"),
      ])

      const buyerData = await buyerResponse.json()
      const sellerData = await sellerResponse.json()

      setBuyerOrders(buyerData)
      setSellerOrders(sellerData)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await updateOrderStatus(orderId, status, trackingNumber)
      toast.success("Order status updated")
      loadOrders()
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Failed to update order status")
    }
  }

  const handleRequestRefund = async (orderId: string) => {
    const reason = prompt("Please provide a reason for the refund:")
    if (!reason) return

    try {
      await createRefundRequest(orderId, reason)
      toast.success("Refund request submitted")
      loadOrders()
    } catch (error) {
      console.error("Error requesting refund:", error)
      toast.error("Failed to submit refund request")
    }
  }

  const handleMessage = (userId: string) => {
    router.push(`/messages?user=${userId}`)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          {buyerOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No purchases yet</p>
          ) : (
            buyerOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                userType="buyer"
                onUpdateStatus={handleUpdateStatus}
                onRequestRefund={handleRequestRefund}
                onMessage={handleMessage}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {sellerOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No sales yet</p>
          ) : (
            sellerOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                userType="seller"
                onUpdateStatus={handleUpdateStatus}
                onMessage={handleMessage}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
