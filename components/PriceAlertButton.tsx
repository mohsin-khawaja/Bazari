"use client"

import { useState } from "react"
import { TrendingDown, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { createPriceAlert, getPriceAlerts, deletePriceAlert } from "@/lib/supabase/notifications"
import { useToast } from "@/hooks/use-toast"

interface PriceAlertButtonProps {
  itemId: string
  currentPrice: number
  itemTitle: string
}

interface PriceAlert {
  id: string
  target_price: number
  original_price: number
  created_at: string
}

export default function PriceAlertButton({ itemId, currentPrice, itemTitle }: PriceAlertButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [targetPrice, setTargetPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [existingAlert, setExistingAlert] = useState<PriceAlert | null>(null)

  const checkExistingAlert = async () => {
    if (!user) return

    try {
      const alerts = await getPriceAlerts(user.id)
      const alert = alerts.find((a) => a.item_id === itemId)
      setExistingAlert(alert || null)
    } catch (error) {
      console.error("Error checking existing alert:", error)
    }
  }

  const handleCreateAlert = async () => {
    if (!user || !targetPrice) return

    const price = Number.parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price amount",
        variant: "destructive",
      })
      return
    }

    if (price >= currentPrice) {
      toast({
        title: "Price too high",
        description: "Target price must be lower than current price",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await createPriceAlert(user.id, itemId, price, currentPrice)

      toast({
        title: "Price alert created!",
        description: `We'll notify you when "${itemTitle}" drops to $${price.toFixed(2)}`,
      })

      setExistingAlert({
        id: "temp",
        target_price: price,
        original_price: currentPrice,
        created_at: new Date().toISOString(),
      })

      setIsOpen(false)
      setTargetPrice("")
    } catch (error) {
      console.error("Error creating price alert:", error)
      toast({
        title: "Error",
        description: "Failed to create price alert. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlert = async () => {
    if (!existingAlert) return

    setLoading(true)
    try {
      await deletePriceAlert(existingAlert.id)

      toast({
        title: "Price alert removed",
        description: "You'll no longer receive notifications for this item",
      })

      setExistingAlert(null)
      setIsOpen(false)
    } catch (error) {
      console.error("Error deleting price alert:", error)
      toast({
        title: "Error",
        description: "Failed to remove price alert. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open) {
          checkExistingAlert()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <TrendingDown className="h-4 w-4" />
          {existingAlert ? "Price Alert Set" : "Set Price Alert"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Price Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Get notified when the price drops below your target</div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{itemTitle}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Price:</span>
                <span className="font-semibold">${currentPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {existingAlert ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Alert Active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAlert}
                    disabled={loading}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Target Price:</span>
                    <span className="font-semibold">${existingAlert.target_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Savings:</span>
                    <span className="font-semibold text-green-600">
                      ${(currentPrice - existingAlert.target_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetPrice">Target Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentPrice - 0.01}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Must be lower than current price (${currentPrice.toFixed(2)})
                </div>
              </div>

              {targetPrice &&
                !isNaN(Number.parseFloat(targetPrice)) &&
                Number.parseFloat(targetPrice) < currentPrice && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>You'll save:</span>
                          <span className="font-semibold text-blue-600">
                            ${(currentPrice - Number.parseFloat(targetPrice)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span className="font-semibold text-blue-600">
                            {(((currentPrice - Number.parseFloat(targetPrice)) / currentPrice) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAlert}
                  disabled={loading || !targetPrice || Number.parseFloat(targetPrice) >= currentPrice}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Alert
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>How it works:</strong> We'll check prices daily and notify you via email and push notification when
            your target price is reached. You can manage all your price alerts in your notification settings.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
