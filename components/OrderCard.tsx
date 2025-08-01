"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, RefreshCw, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface OrderCardProps {
  order: any
  userType: "buyer" | "seller"
  onUpdateStatus?: (orderId: string, status: string, trackingNumber?: string) => void
  onRequestRefund?: (orderId: string) => void
  onMessage?: (userId: string) => void
}

export function OrderCard({ order, userType, onUpdateStatus, onRequestRefund, onMessage }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const otherUser = userType === "buyer" ? order.seller : order.buyer

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ").toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {order.order_items.map((orderItem: any) => (
            <div key={orderItem.id} className="flex gap-3">
              {orderItem.item.item_images?.[0] && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={orderItem.item.item_images[0].image_url || "/placeholder.svg"}
                    alt={orderItem.item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium">{orderItem.item.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Qty: {orderItem.quantity} × ${orderItem.price}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(orderItem.quantity * orderItem.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              {userType === "buyer" ? "Seller" : "Buyer"}: {otherUser.full_name}
            </p>
            {order.tracking_number && (
              <p className="text-sm text-muted-foreground">Tracking: {order.tracking_number}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">${order.total_amount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onMessage?.(otherUser.id)}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </Button>

          {userType === "seller" && order.status === "paid" && (
            <Button
              size="sm"
              onClick={() => {
                const trackingNumber = prompt("Enter tracking number:")
                if (trackingNumber) {
                  onUpdateStatus?.(order.id, "shipped", trackingNumber)
                }
              }}
            >
              <Truck className="w-4 h-4 mr-1" />
              Mark Shipped
            </Button>
          )}

          {userType === "buyer" && order.status === "shipped" && (
            <Button size="sm" onClick={() => onUpdateStatus?.(order.id, "delivered")}>
              <Package className="w-4 h-4 mr-1" />
              Mark Delivered
            </Button>
          )}

          {userType === "buyer" && ["paid", "shipped"].includes(order.status) && (
            <Button variant="outline" size="sm" onClick={() => onRequestRefund?.(order.id)}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Request Refund
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
